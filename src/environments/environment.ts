/**
 * Production environment.
 *
 * The Firebase web config is NOT a secret — it identifies your project.
 * Access is protected by Security Rules (+ App Check, recommended).
 * Copy these values from Firebase Console → Project settings → Your apps.
 */
export const environment = {
  production: true,
  /** Public origin used for share links and Open Graph URLs. */
  siteUrl: 'https://your-firebase-project-id.web.app',
  firebase: {
    apiKey: 'REPLACE_ME',
    authDomain: 'your-firebase-project-id.firebaseapp.com',
    projectId: 'your-firebase-project-id',
    storageBucket: 'your-firebase-project-id.firebasestorage.app',
    messagingSenderId: 'REPLACE_ME',
    appId: 'REPLACE_ME',
  },
  /** reCAPTCHA Enterprise site key for App Check. Empty string = App Check off. */
  appCheckSiteKey: '',
  /** Connect to local Firebase emulators instead of the real project. */
  useEmulators: false,
};

export type Environment = typeof environment;
