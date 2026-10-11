/** A string available in both languages. Nepali (Devanagari) is always first-class. */
export interface Bilingual {
  ne: string;
  en: string;
}

export type Lang = keyof Bilingual;

/** Stable ids — also validated in firestore.rules (`validDay`). Keep in sync! */
export const DAY_IDS = [
  'dashain',
  'ghatasthapana',
  'navaratri',
  'fulpati',
  'maha-ashtami',
  'maha-navami',
  'bijaya-dashami',
  'kojagrat-purnima',
] as const;

export type DayId = (typeof DAY_IDS)[number];

export function isDayId(v: unknown): v is DayId {
  return typeof v === 'string' && (DAY_IDS as readonly string[]).includes(v);
}

/** One day (or the whole festival) the user can make a card for. */
export interface FestivalDay {
  id: DayId;
  /** Day number of the 15-day festival (1 = Ghatasthapana). 0 = whole festival. */
  dayNumber: number;
  name: Bilingual;
  /** Short, accurate description shown in the day selector. */
  description: Bilingual;
  /** Single emoji-free motif key used for the day badge illustration. */
  motif: 'kalash' | 'jamara' | 'diyo' | 'marigold' | 'trishul' | 'tika' | 'moon' | 'lotus';
  /** Accent colour for the day (CSS colour). */
  accent: string;
}

/** A ready-made greeting the user can pick (and then edit). */
export interface Greeting {
  id: string;
  /** Which days this greeting fits. `dashain` greetings fit any day. */
  days: DayId[];
  /** Main line shown big on the card. */
  greeting: Bilingual;
  /** Optional blessing / sub-line. */
  subline?: Bilingual;
}
