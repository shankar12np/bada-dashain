# Tika · टीका

Dashain & Bijaya Dashami greeting cards with your own photo — Angular 22 + Firebase PWA.
See **ARCHITECTURE.md** for decisions, data model, rules and the roadmap.

## Requirements
* Node **22.22.3+ or 24.15+** (Angular CLI 22 requirement)
* Firebase CLI: `npm i -g firebase-tools`
* Java 21 (only for the Firestore/Storage emulators)

## Run locally (no real Firebase needed)
```bash
npm install
firebase emulators:start      # terminal 1 — auth, firestore, storage, functions
npm start                     # terminal 2 — http://localhost:4200
```
`ng serve` uses `environment.development.ts`, which points at the emulators
with the `demo-tika` project id.

## First deploy
1. Create a Firebase project; enable **Authentication → Google + Anonymous**, **Firestore**, **Storage**.
2. Put your web config into `src/environments/environment.ts` and your project id into `.firebaserc`.
3. Add your domain to Auth → Settings → Authorized domains.
4. Deploy:
   ```bash
   npm run build
   firebase deploy --only firestore,storage,hosting
   gsutil cors set cors.json gs://<your-bucket>      # enables "Share image" / download
   ```
5. (Blaze plan) `cd functions && npm install && cd .. && firebase deploy --only functions`
   — rich link previews on WhatsApp/Facebook, remix counts and auto-moderation.
   Without functions, also remove the `/c/**` rewrite from `firebase.json`.

## Adding a template
Copy an object in `src/app/data/templates.ts`, give it a new `id`, adjust layers.
Motifs available: `pattern-dhaka, mandala, border, toran, garland, marigold, diyo,
kalash, jamara, tika, mountains, kites, sun-rays, trishul, lotus, moon, image, grain`.

## Every Dashain
Update `DASHAIN_DATES` in `src/app/data/festival-days.ts` from the official holiday list.
