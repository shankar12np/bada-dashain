import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { environment } from '../../../environments/environment';

/**
 * Firebase is used through the official modular JS SDK, wrapped in tiny
 * tree-shakable Angular injection tokens, instead of @angular/fire.
 *
 * Why: @angular/fire currently trails Angular majors (its latest release peers
 * on Angular 20), and the modular SDK + signals is all a zoneless app needs.
 * Each Firebase product lives in its own file, so it's only bundled into the
 * lazy route chunks that actually use it.
 */
let app: FirebaseApp | undefined;

export function firebaseApp(): FirebaseApp {
  if (app) return app;
  app = getApps()[0] ?? initializeApp(environment.firebase);

  // App Check (recommended in production): blocks scripted abuse of your
  // Firestore/Storage quota. Loaded lazily so it doesn't weigh on startup.
  if (environment.appCheckSiteKey && typeof window !== 'undefined') {
    void import('firebase/app-check').then(({ initializeAppCheck, ReCaptchaEnterpriseProvider }) =>
      initializeAppCheck(app!, {
        provider: new ReCaptchaEnterpriseProvider(environment.appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      }),
    );
  }
  return app;
}
