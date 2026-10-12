# Deploying Bada Dashain (Tika) — Mac

Replace `YOUR-PROJECT-ID` everywhere with your Firebase project id.

## 1. Firebase console (browser, one time)
1. https://console.firebase.google.com → **Add project** (Google Analytics: optional).
2. **Upgrade to Blaze** (gear → Usage and billing). Needed for Storage and Functions.
   Then in Google Cloud Billing → **Budgets & alerts** → create a $5–10 budget alert.
3. **Authentication → Get started → Sign-in method**: enable **Anonymous** and **Google**
   (pick your email as support email).
4. **Firestore Database → Create database** → production mode → location **nam5 (us-central)**.
5. **Storage → Get started** → production mode → location **us-central1**.
6. Project settings → **Your apps → Web (</>)** → register app "Bada Dashain" → copy the
   `firebaseConfig` values.

## 2. Put your config in the project
`src/environments/environment.ts` → paste `apiKey`, `authDomain`, `projectId`,
`storageBucket`, `messagingSenderId`, `appId`, and set
`siteUrl: 'https://YOUR-PROJECT-ID.web.app'`.

`.firebaserc` → `{ "projects": { "default": "YOUR-PROJECT-ID" } }`

## 3. Deploy (Terminal, in ~/Projects/tika)
```bash
npx firebase login
npm run deploy:rules       # Firestore + Storage security rules and indexes
npm run deploy:functions   # link previews, remix counts, auto-moderation
npm run deploy:web         # builds and uploads the app
```
First functions deploy asks to enable some Google APIs and about an image clean-up
policy — answer **Yes** (1 day is fine).

## 4. Storage CORS (lets "Share image" and Download work)
Open https://console.cloud.google.com/ → select the project → **Activate Cloud Shell** (>_ icon), then:
```bash
cat > cors.json <<'EOF'
[{"origin":["https://YOUR-PROJECT-ID.web.app","https://YOUR-PROJECT-ID.firebaseapp.com"],"method":["GET"],"maxAgeSeconds":3600}]
EOF
gcloud storage buckets update gs://YOUR-PROJECT-ID.firebasestorage.app --cors-file=cors.json
```

## 5. Check
Open https://YOUR-PROJECT-ID.web.app on your phone → make a card → share it to yourself on
WhatsApp. The gallery may show an error for a few minutes while Firestore builds its indexes.

## Updating later
After changing code: `npm run deploy:web` (and `npm run deploy:rules` / `deploy:functions`
only if you changed those files).

## Auto-delete after 15 days
* Firestore: `npm run deploy:rules` turns on the TTL policy for `cards.expireAt`
  (set by the app to 15 days after creation). Deletion runs within ~24h of expiry.
* Storage: one-time bucket lifecycle rule (Cloud Shell):
  ```bash
  gcloud storage buckets update gs://bada-dashain.firebasestorage.app --lifecycle-file=storage-lifecycle.json
  ```
  (paste the contents of `storage-lifecycle.json` into Cloud Shell first).
To change the lifetime, update `CARD_LIFETIME_DAYS` (card.model.ts), the 14/16-day window in
firestore.rules, and `age` in storage-lifecycle.json together.
