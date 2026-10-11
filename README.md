# Tika · टीका

Dashain & Bijaya Dashami greeting cards with your own photo — Angular 22 + Firebase PWA.
See **ARCHITECTURE.md** for decisions, data model, rules and the roadmap.

## Setup (everything stays local to this project)
* **Node 24** is pinned in `.node-version` / `.nvmrc`. Use [fnm](https://github.com/Schniz/fnm) to switch automatically.
  `.npmrc` has `engine-strict=true`, so `npm install` refuses to run on a wrong Node version.
* **Angular CLI and Firebase CLI are dev dependencies** — no global installs. Run them via npm scripts or `npx ng …` / `npx firebase …`.
* Java 21 (`brew install openjdk@21`) is used only by `npm run emulators` — your Mac's default Java is left untouched.

```bash
fnm use            # picks Node 24 from .node-version (installs it if missing with: fnm install)
npm ci             # exact versions from package-lock.json
npm run emulators  # terminal 1 — local auth/firestore/storage (http://localhost:4000 UI)
npm start          # terminal 2 — http://localhost:4200
```

## First deploy
1. Create a Firebase project; enable **Authentication → Google + Anonymous**, **Firestore**, **Storage**.
2. Put your web config into `src/environments/environment.ts` and your project id into `.firebaserc`.
3. Add your domain to Auth → Settings → Authorized domains.
4. Deploy:
   ```bash
   npx firebase login
   npm run deploy:rules
   npm run deploy:web
   gsutil cors set cors.json gs://<your-bucket>      # enables "Share image" / download
   ```
5. (Blaze plan) `npm run deploy:functions`
   — rich link previews on WhatsApp/Facebook, remix counts and auto-moderation.
   Without functions, also remove the `/c/**` rewrite from `firebase.json`.

## Adding a template
Copy an object in `src/app/data/templates.ts`, give it a new `id`, adjust layers.
Motifs available: `pattern-dhaka, mandala, border, toran, garland, marigold, diyo,
kalash, jamara, tika, mountains, kites, sun-rays, trishul, lotus, moon, image, grain`.

## Every Dashain
Update `DASHAIN_DATES` in `src/app/data/festival-days.ts` from the official holiday list.
