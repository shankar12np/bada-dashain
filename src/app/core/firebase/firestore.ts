import { InjectionToken } from '@angular/core';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { connectStorageEmulator, getStorage, type FirebaseStorage } from 'firebase/storage';
import { environment } from '../../../environments/environment';
import { firebaseApp } from './firebase-app';

/**
 * Firestore with an offline, multi-tab IndexedDB cache — the gallery and your
 * own cards open instantly on repeat visits and work offline in the PWA.
 * Only imported from lazy routes, so it isn't part of the initial bundle.
 */
export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE', {
  providedIn: 'root',
  factory: () => {
    const db = initializeFirestore(firebaseApp(), {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
    if (environment.useEmulators) connectFirestoreEmulator(db, '127.0.0.1', 8080);
    return db;
  },
});

export const STORAGE = new InjectionToken<FirebaseStorage>('STORAGE', {
  providedIn: 'root',
  factory: () => {
    const storage = getStorage(firebaseApp());
    if (environment.useEmulators) connectStorageEmulator(storage, '127.0.0.1', 9199);
    return storage;
  },
});
