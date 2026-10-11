/** Shape of every environment file. Kept separate because Angular's
 *  fileReplacements swaps environment.ts for environment.development.ts. */
export interface Environment {
  production: boolean;
  siteUrl: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  appCheckSiteKey: string;
  useEmulators: boolean;
}
