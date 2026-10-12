import type { Environment } from './environment.model';

/**
 * Production environment.
 *
 * The Firebase web config is NOT a secret — it identifies your project.
 * Access is protected by Security Rules (+ App Check, recommended).
 * Copy these values from Firebase Console → Project settings → Your apps.
 */

export const environment: Environment = {
  production: true,
  /** Public origin used for share links and Open Graph URLs. */
  siteUrl: 'https://bada-dashain.web.app',
  firebase: {
    apiKey: 'AIzaSyAADOdMdTJecjBhjZakzoh7EGXxkMDn9ew',
    authDomain: 'bada-dashain.firebaseapp.com',
    projectId: 'bada-dashain',
    storageBucket: 'bada-dashain.firebasestorage.app',
    messagingSenderId: '636945516956',
    appId: '1:636945516956:web:46372b308803a31bd2e059',
  },
  /** reCAPTCHA Enterprise site key for App Check. Empty string = App Check off. */
  appCheckSiteKey: '',
  /** Connect to local Firebase emulators instead of the real project. */
  useEmulators: false,
};

