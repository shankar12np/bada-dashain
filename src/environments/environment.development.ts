import type { Environment } from './environment';

/**
 * Development environment — used by `ng serve`.
 * Points at the local Firebase Emulator Suite (`firebase emulators:start`),
 * so you can develop without touching production data or paying for reads.
 */
export const environment: Environment = {
  production: false,
  siteUrl: 'http://localhost:4200',
  firebase: {
    apiKey: 'demo-key',
    authDomain: 'demo-tika.firebaseapp.com',
    // A `demo-` project id tells the emulators no real project is needed.
    projectId: 'demo-tika',
    storageBucket: 'demo-tika.appspot.com',
    messagingSenderId: '0',
    appId: '1:0:web:0',
  },
  appCheckSiteKey: '',
  useEmulators: true,
};
