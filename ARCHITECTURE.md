# Tika · टीका — Architecture

> **Tika — Dashain blessings, shared from the heart.**
> *आशीर्वाद, जुन तपाईं बाँड्न सक्नुहुन्छ।*

Why "Tika": it's the single most recognisable act of Bijaya Dashami (receiving
tika and jamara from elders), it's short, the same word in Nepali and English,
and it reads well as an app icon (a red tika dot in a gold ring). The app also
works for every other day of the festival, not only Dashami.

---

## 1. Key decisions

| Decision | Why |
|---|---|
| **Angular 22, standalone, zoneless, signals** | Latest stable. No NgModules, no Zone.js; state is plain signals → simple for one person to maintain. |
| **Firebase modular SDK, not `@angular/fire`** | AngularFire's latest release only peers on Angular 20. Thin injection tokens over the official SDK are ~30 lines and never block an Angular upgrade. |
| **Konva for cards** | Gives the editor drag / pinch / hit-testing and exports at any `pixelRatio` from the same scene. html2canvas is unreliable with Devanagari shaping and CSS. |
| **Templates are data, motifs are code** | Each template is a ~40-line object. Jamara, kalash, diyo, marigold, Dhaka patterns, trishul, lotus… are drawn procedurally: crisp at every size, zero licensing risk, zero Storage cost. An `image` layer type exists for commissioned artwork (e.g. a respectful Durga illustration) later. |
| **Client-side rendering only** | No image servers. The upload is the finished card (≈300 KB) + 432px thumb (≈30 KB) + 1200×630 OG image. |
| **The user's original photo is never uploaded** | Privacy (family photos, elders, children) and cost. "Make it mine" doesn't need it — remixers bring their own photo. |
| **Cards are immutable** | Owners can only flip visibility or delete. A shared link can never be swapped for different content. |
| **Tailwind v4 + self-hosted fonts** | Fast to style, tiny CSS. Fonts via `@fontsource` so canvas text has its font *before* drawing, and the PWA works offline. |
| **Runtime i18n (signal), not Angular i18n** | Instant ne⇄en switching, one build, both scripts on one page. Card language is chosen separately from UI language. |
| **Anonymous auth by default** | Nobody has to sign in to make or share a card. Google sign-in *links* to the anonymous account so existing cards are kept. |

## 2. Folder structure

```
tika/
├─ firebase.json               Hosting (rewrites /c/** → cardPage), emulators
├─ firestore.rules             Field-level validation, immutable cards
├─ firestore.indexes.json      Gallery + "my cards" composite indexes
├─ storage.rules               cards/{uid}/{cardId}/{card|thumb|og}.jpg
├─ cors.json                   Bucket CORS (needed for "Share image"/download)
├─ functions/                  cardPage (OG tags), remix counter, report moderation
├─ public/                     icons, manifest, og-default.jpg
└─ src/
   ├─ environments/            Firebase config (prod) / emulators (dev)
   ├─ styles.css               Tailwind theme: sindoor, maroon, gold, saffron, jamara, cream
   └─ app/
      ├─ app.ts / app.routes.ts / app.config.ts
      ├─ core/                 singletons, no UI
      │  ├─ firebase/          firebase-app.ts (app + App Check), firestore.ts (Firestore+Storage tokens)
      │  ├─ auth/              AuthService (signals, anonymous → Google linking)
      │  ├─ i18n/              I18nService + translations.ts
      │  ├─ seo/               SeoService (title/meta/OG)
      │  └─ ui/                ToastService
      ├─ models/               festival / card / template interfaces
      ├─ data/                 festival-days.ts (+ yearly dates), greetings.ts, templates.ts
      ├─ features/
      │  ├─ render/            motifs.ts, card-scene.ts (Konva), card-render.service.ts
      │  ├─ cards/             card.repository.ts — ALL Firestore/Storage access
      │  ├─ home/              home.page.ts
      │  ├─ days/              day-selector.ts, choose-day.page.ts
      │  ├─ editor/            editor.page.ts/.html, template-picker.ts
      │  ├─ viewer/            viewer.page.ts, share.service.ts, report-dialog.ts
      │  ├─ gallery/           gallery.page.ts, recent-cards.ts
      │  ├─ my-cards/          my-cards.page.ts
      │  └─ not-found/
      └─ shared/components/    site-header, toasts, card-thumb, day-icon
```

Rule of thumb: **components never import `firebase/*`** — they go through
`AuthService` or `CardRepository`.

## 3. Data model

### `cards/{cardId}`
```jsonc
{
  "ownerUid": "anon-or-google-uid",
  "ownerName": "Sita Sharma",              // display name or "from" line
  "dayId": "bijaya-dashami",               // one of 8 ids (validated in rules)
  "templateId": "rajdarbar",               // never rename template ids
  "text": {
    "greeting": "विजया दशमी २०८३ को हार्दिक मंगलमय शुभकामना",
    "subline": "असत्यमाथि सत्यको विजयको यो पर्वले …",
    "from": "शर्मा परिवार",
    "color": null,                          // null = template default
    "offsetY": 0,
    "lang": "ne"
  },
  "visibility": "public",                   // public = gallery; unlisted = link only
  "imagePath": "cards/{uid}/{cardId}/card.jpg",
  "imageUrl": "https://firebasestorage.googleapis.com/…/card.jpg?alt=media&token=…",
  "thumbUrl": "…/thumb.jpg…",
  "ogUrl": "…/og.jpg…",
  "width": 1080, "height": 1350,
  "remixOf": "parentCardId",                // "Make it mine" source, or null
  "rootId": "firstCardInChain",             // or null
  "remixCount": 0,                          // Cloud Function only
  "reportCount": 0,                         // Cloud Function only
  "status": "active",                       // "hidden" after moderation
  "createdAt": "<server timestamp>",
  "schemaVersion": 1
}
```

### `reports/{cardId}_{uid}` (write-only for users; one per user per card)
```json
{ "cardId": "…", "reporterUid": "…", "reason": "disrespectful", "note": null, "createdAt": "<ts>" }
```

### `users/{uid}` (reserved for profiles — Phase 3)
```json
{ "displayName": "Sita Sharma", "photoURL": "https://…", "updatedAt": "<ts>" }
```

Days, greetings and templates are **static data in the bundle**, not Firestore:
zero reads, versioned with the code, reviewable in a PR.

## 4. Security rules — what they guarantee

* Anyone can **get** an active card by id (shared links work logged-out).
* The gallery can only **list** `visibility == public && status == active`.
* **Create** requires: signed-in (anonymous OK), `ownerUid == auth.uid`,
  key allow-list, valid day id, text length/colour limits, image path inside
  the creator's own folder, counters at 0, `status == 'active'`, `createdAt == request.time`.
* **Update**: owner may change `visibility` only. Counters & status: functions only.
* **Storage**: only `card|thumb|og` JPEG/PNG/WebP < 3 MB, written once, by the owner.
* Reports: create-only, one per user per card (doc id = `${cardId}_${uid}`).

Turn on **App Check** (reCAPTCHA Enterprise) before launch — set `appCheckSiteKey`.

## 5. Phased plan (solo developer)

**Phase 0 — Setup (½ day)**
Create Firebase project → enable Auth (Google + Anonymous), Firestore, Storage.
Fill `environment.ts`, `.firebaserc`, `cors.json`. `firebase emulators:start` + `npm start`.

**Phase 1 — MVP (done in this codebase)**
Home, day selector, 12 templates, editor (photo/zoom/rotate/drag, greetings,
colour, position), PNG download, save + share link, viewer, "Make it mine",
gallery by day, my cards, report, bilingual UI, PWA, security rules.

**Phase 2 — Launch hardening (1–2 days)**
Deploy functions (Blaze plan) for rich WhatsApp/Facebook previews; App Check;
`gsutil cors set cors.json gs://<bucket>`; have an elder/purohit review all
greetings and descriptions; Lighthouse pass; test on low-end Android + iPhone Safari.

**Phase 3 — Nice-to-haves**
Story (1080×1920) and square (1080×1080) export sizes · multi-photo templates
(add `photos: PhotoFrame[]`) · subtle animated card (diyo flicker → MP4/WebP via
`MediaRecorder`) · user profiles (`users/{uid}`) · admin moderation page
(custom claim `admin`) · more templates & commissioned artwork via the `image` layer.

**Every year (10 minutes)**: update `DASHAIN_DATES` in `data/festival-days.ts`.
