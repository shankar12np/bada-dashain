import { Injectable, computed, signal } from '@angular/core';
import {
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  connectAuthEmulator,
  getRedirectResult,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  initializeAuth,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type Auth,
  type AuthError,
  type User,
} from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { firebaseApp } from '../firebase/firebase-app';

/**
 * Authentication, exposed as signals.
 *
 * Strategy
 *  • Nobody is forced to sign in. When someone saves their first card we
 *    silently create an *anonymous* account (`ensureUser()`).
 *  • "Sign in with Google" on an anonymous account *links* the Google identity
 *    to it, so cards made before signing in stay theirs.
 *  • If that Google account already exists, we simply sign into it (cards made
 *    anonymously on this device remain under the old anonymous uid — an
 *    acceptable MVP trade-off; a Cloud Function can migrate them later).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth: Auth;
  private readonly _user = signal<User | null>(null);
  private readonly _ready = signal(false);
  private readyPromise: Promise<void>;

  /** Current Firebase user (anonymous or Google), or null. */
  readonly user = this._user.asReadonly();
  /** True once Firebase has restored the session from storage. */
  readonly ready = this._ready.asReadonly();
  readonly isSignedIn = computed(() => !!this._user());
  readonly isAnonymous = computed(() => this._user()?.isAnonymous ?? true);
  /** A Google-linked (non-anonymous) account. */
  readonly isRegistered = computed(() => !!this._user() && !this._user()!.isAnonymous);
  readonly displayName = computed(() => this._user()?.displayName ?? null);
  readonly photoURL = computed(() => this._user()?.photoURL ?? null);

  constructor() {
    this.auth = initializeAuth(firebaseApp(), {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
    if (environment.useEmulators) {
      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    }

    this.readyPromise = new Promise((resolve) => {
      onAuthStateChanged(this.auth, (u) => {
        this._user.set(u);
        this._ready.set(true);
        resolve();
      });
    });

    // Complete a redirect sign-in if we fell back to one (popup blocked).
    getRedirectResult(this.auth).catch((e) => console.warn('[auth] redirect result', e));
  }

  /** Resolve once the persisted session is known. */
  whenReady(): Promise<void> {
    return this.readyPromise;
  }

  /** Return the current user, creating an anonymous one if needed. */
  async ensureUser(): Promise<User> {
    await this.readyPromise;
    if (this.auth.currentUser) return this.auth.currentUser;
    const cred = await signInAnonymously(this.auth);
    return cred.user;
  }

  /** Sign in with Google, upgrading an anonymous account when possible. */
  async signInWithGoogle(): Promise<User> {
    await this.readyPromise;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const current = this.auth.currentUser;

    try {
      if (current?.isAnonymous) {
        const cred = await linkWithPopup(current, provider);
        // linkWithPopup doesn't emit onAuthStateChanged — refresh our signal.
        this._user.set(null);
        this._user.set(cred.user);
        return cred.user;
      }
      return (await signInWithPopup(this.auth, provider)).user;
    } catch (err) {
      const e = err as AuthError;
      if (e.code === 'auth/credential-already-in-use') {
        // This Google account already exists → just sign in to it.
        const credential = GoogleAuthProvider.credentialFromError(e);
        if (credential) return (await signInWithCredential(this.auth, credential)).user;
      }
      throw err;
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  /** Human-friendly message for an auth error (bilingual handled by caller keys). */
  static errorKey(err: unknown): string {
    const code = (err as AuthError)?.code ?? '';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return 'auth.cancelled';
    if (code === 'auth/popup-blocked') return 'auth.popupBlocked';
    if (code === 'auth/network-request-failed') return 'error.network';
    return 'auth.failed';
  }
}
