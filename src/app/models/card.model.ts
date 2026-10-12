import type { Timestamp } from 'firebase/firestore';
import type { DayId, Lang } from './festival.model';

export type CardVisibility = 'public' | 'unlisted';
export type CardStatus = 'active' | 'hidden';

/** The editable text on a card. Stored in Firestore so "Make it mine" can reuse it. */
export interface CardText {
  greeting: string;
  subline?: string | null;
  /** Sender line, e.g. "— Sharma Pariwar". */
  from?: string | null;
  /** Override of the template's text colour (hex #rrggbb). */
  color?: string | null;
  /** Vertical nudge for the text block, in card pixels (−400..400). */
  offsetY?: number;
  /** Language of the greeting — decides which font the renderer uses. */
  lang: Lang;
}

/** Firestore document: `cards/{cardId}`. */
export interface CardDoc {
  ownerUid: string;
  ownerName?: string | null;
  dayId: DayId;
  templateId: string;
  text: CardText;
  visibility: CardVisibility;
  /** Storage path of the full card, e.g. `cards/{uid}/{cardId}/card.jpg`. */
  imagePath: string;
  imageUrl: string;
  thumbUrl: string;
  /** 1200×630 social preview image. */
  ogUrl?: string | null;
  width: number;
  height: number;
  /** Card this one was remixed from ("Make it mine"). */
  remixOf?: string | null;
  /** First card in the remix chain — handy for "N people shared this design". */
  rootId?: string | null;
  /** Maintained by Cloud Functions only. */
  remixCount: number;
  reportCount: number;
  status: CardStatus;
  createdAt: Timestamp;
  /** When the card deletes itself (Firestore TTL policy). See CARD_LIFETIME_DAYS. */
  expireAt?: Timestamp;
  schemaVersion: 1;
}

/**
 * Cards clean themselves up this many days after they are made (the festival is over):
 *  • Firestore deletes the record via a TTL policy on `expireAt` (firestore.indexes.json)
 *  • Cloud Storage deletes the images via a bucket lifecycle rule (storage-lifecycle.json)
 */
export const CARD_LIFETIME_DAYS = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

/** True once a card is past its lifetime (TTL deletion can lag up to ~24h, so check ourselves). */
export function isExpired(card: Pick<CardDoc, 'createdAt' | 'expireAt'>, now = Date.now()): boolean {
  const end = card.expireAt?.toMillis() ?? (card.createdAt ? card.createdAt.toMillis() + CARD_LIFETIME_DAYS * DAY_MS : Infinity);
  return now >= end;
}

/** Oldest createdAt that is still within the lifetime. */
export function lifetimeStart(now = Date.now()): Date {
  return new Date(now - CARD_LIFETIME_DAYS * DAY_MS);
}

/** A card doc together with its id — what components work with. */
export interface Card extends CardDoc {
  id: string;
}

/** Photo placement inside a template's photo frame (editor-only, not stored). */
export interface PhotoTransform {
  /** Offset of the photo centre from the frame centre, in card pixels. */
  x: number;
  y: number;
  /** 1 = "cover" the frame exactly. */
  scale: number;
  /** Degrees. */
  rotation: number;
}

export const DEFAULT_TRANSFORM: PhotoTransform = { x: 0, y: 0, scale: 1, rotation: 0 };

/** Everything the renderer needs to draw a card. */
export interface CardDesign {
  templateId: string;
  dayId: DayId;
  text: CardText;
  /** Decoded user photo (already downscaled). Null renders a tasteful placeholder. */
  photo: CanvasImageSource | null;
  photoSize?: { width: number; height: number };
  transform: PhotoTransform;
}
