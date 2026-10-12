import { Injectable, inject } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type Query,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FIRESTORE, STORAGE } from '../../core/firebase/firestore';
import { CARD_LIFETIME_DAYS, isExpired, lifetimeStart, type Card, type CardDoc, type CardText, type CardVisibility } from '../../models/card.model';
import type { DayId } from '../../models/festival.model';
import type { CardExports } from '../render/card-render.service';

export interface PublishInput {
  cardId: string;
  uid: string;
  ownerName: string | null;
  dayId: DayId;
  templateId: string;
  text: CardText;
  visibility: CardVisibility;
  remixOf: string | null;
  rootId: string | null;
  images: CardExports;
}

export interface Page {
  cards: Card[];
  cursor: QueryDocumentSnapshot | null;
}

export type ReportReason = 'inappropriate' | 'disrespectful' | 'spam' | 'copyright' | 'other';

const PAGE_SIZE = 24;
/** Card images never change once uploaded → cache forever on CDN + browser. */
const CACHE = 'public, max-age=31536000, immutable';

/**
 * All Firestore + Storage access for cards lives here.
 * Components never touch Firebase directly → easy to test and to swap.
 */
@Injectable({ providedIn: 'root' })
export class CardRepository {
  private readonly db = inject(FIRESTORE);
  private readonly storage = inject(STORAGE);

  /** Reserve an id up front so Storage paths and the doc share it. */
  newId(): string {
    return doc(collection(this.db, 'cards')).id;
  }

  /**
   * Upload the rendered images, then create the card document.
   * Order matters: the doc is only written once its images exist, so a shared
   * link never points at a missing image.
   */
  async publish(input: PublishInput): Promise<string> {
    const base = `cards/${input.uid}/${input.cardId}`;
    const upload = async (name: string, blob: Blob) => {
      const r = ref(this.storage, `${base}/${name}.jpg`);
      await uploadBytes(r, blob, { contentType: 'image/jpeg', cacheControl: CACHE });
      return getDownloadURL(r);
    };
    const [imageUrl, thumbUrl, ogUrl] = await Promise.all([
      upload('card', input.images.card),
      upload('thumb', input.images.thumb),
      upload('og', input.images.og),
    ]);

    const data: Omit<CardDoc, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
      ownerUid: input.uid,
      ownerName: input.ownerName,
      dayId: input.dayId,
      templateId: input.templateId,
      text: normaliseText(input.text),
      visibility: input.visibility,
      imagePath: `${base}/card.jpg`,
      imageUrl,
      thumbUrl,
      ogUrl,
      width: 1080,
      height: 1350,
      remixOf: input.remixOf,
      rootId: input.rootId,
      remixCount: 0,
      reportCount: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      // Firestore's TTL policy deletes the record after this time.
      expireAt: Timestamp.fromMillis(Date.now() + CARD_LIFETIME_DAYS * 24 * 60 * 60 * 1000),
      schemaVersion: 1,
    };
    await setDoc(doc(this.db, 'cards', input.cardId), data);
    return input.cardId;
  }

  async get(id: string): Promise<Card | null> {
    try {
      const snap = await getDoc(doc(this.db, 'cards', id));
      if (!snap.exists()) return null;
      const card = { id: snap.id, ...(snap.data() as CardDoc) } as Card;
      // Past its 15 days: treat as gone even if the TTL hasn't run yet (images may already be deleted).
      return isExpired(card) ? null : card;
    } catch (e) {
      // permission-denied == hidden by moderation or bad id.
      if ((e as { code?: string }).code === 'permission-denied') return null;
      throw e;
    }
  }

  /** Public gallery page, newest first, optionally filtered by day. */
  async listPublic(day: DayId | null, cursor: QueryDocumentSnapshot | null = null): Promise<Page> {
    const c: QueryConstraint[] = [where('visibility', '==', 'public'), where('status', '==', 'active')];
    if (day) c.push(where('dayId', '==', day));
    // Only cards still within their lifetime (same field as orderBy → existing indexes still apply).
    c.push(where('createdAt', '>', Timestamp.fromDate(lifetimeStart())));
    c.push(orderBy('createdAt', 'desc'));
    if (cursor) c.push(startAfter(cursor));
    c.push(limit(PAGE_SIZE));
    return this.page(query(collection(this.db, 'cards'), ...c));
  }

  async listMine(uid: string, cursor: QueryDocumentSnapshot | null = null): Promise<Page> {
    const c: QueryConstraint[] = [
      where('ownerUid', '==', uid),
      where('createdAt', '>', Timestamp.fromDate(lifetimeStart())),
      orderBy('createdAt', 'desc'),
    ];
    if (cursor) c.push(startAfter(cursor));
    c.push(limit(PAGE_SIZE));
    return this.page(query(collection(this.db, 'cards'), ...c));
  }

  setVisibility(id: string, visibility: CardVisibility): Promise<void> {
    return updateDoc(doc(this.db, 'cards', id), { visibility });
  }

  /** Delete the doc first (link stops working immediately), then the files. */
  async delete(card: Card): Promise<void> {
    await deleteDoc(doc(this.db, 'cards', card.id));
    const base = `cards/${card.ownerUid}/${card.id}`;
    await Promise.allSettled(['card', 'thumb', 'og'].map((n) => deleteObject(ref(this.storage, `${base}/${n}.jpg`))));
  }

  /** One report per user per card (doc id enforces it in the rules). */
  async report(cardId: string, uid: string, reason: ReportReason, note: string): Promise<void> {
    await setDoc(doc(this.db, 'reports', `${cardId}_${uid}`), {
      cardId,
      reporterUid: uid,
      reason,
      note: note.trim().slice(0, 300) || null,
      createdAt: serverTimestamp(),
    });
  }

  private async page(q: Query<DocumentData>): Promise<Page> {
    const snap = await getDocs(q);
    return {
      cards: snap.docs.map((d) => ({ id: d.id, ...(d.data() as CardDoc) })),
      cursor: snap.docs.length === PAGE_SIZE ? snap.docs[snap.docs.length - 1] : null,
    };
  }
}

/** Trim + clamp to what the security rules accept. */
function normaliseText(t: CardText): CardText {
  const clean = (s: string | null | undefined, max: number) => {
    const v = (s ?? '').trim().slice(0, max);
    return v.length ? v : null;
  };
  return {
    greeting: (t.greeting ?? '').trim().slice(0, 140) || '—',
    subline: clean(t.subline, 220),
    from: clean(t.from, 60),
    color: t.color && /^#[0-9a-f]{6}$/i.test(t.color) ? t.color : null,
    offsetY: Math.max(-400, Math.min(400, Math.round(t.offsetY ?? 0))),
    lang: t.lang,
  };
}
