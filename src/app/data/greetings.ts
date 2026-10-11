import type { DayId, Greeting, Lang } from '../models/festival.model';
import { bsYear, toNepaliDigits } from './festival-days';

/**
 * Curated greetings. `{year}` is replaced with the current Bikram Sambat year
 * (Devanagari digits in Nepali, Latin digits in English).
 *
 * Style notes:
 *  • Nepali lines use the standard festive formulae ("हार्दिक मंगलमय शुभकामना").
 *  • English offers both translation and the romanised Nepali many in the
 *    diaspora actually use ("Dashain ko hardik shubhakamana").
 */
export const GREETINGS: readonly Greeting[] = [
  // ── Whole festival ───────────────────────────────────────────────────────
  {
    id: 'bada-dashain',
    days: ['dashain'],
    greeting: {
      ne: 'बडा दशैं {year} को हार्दिक मंगलमय शुभकामना',
      en: 'Wishing you a joyous Bada Dashain {year}',
    },
    subline: {
      ne: 'यो दशैंले सबैको जीवनमा सुख, शान्ति, समृद्धि र सुस्वास्थ्य ल्याओस्।',
      en: 'May this Dashain bring happiness, peace, prosperity and good health to you and your family.',
    },
  },
  {
    id: 'dashain-romanised',
    days: ['dashain'],
    greeting: {
      ne: 'दशैंको हार्दिक शुभकामना',
      en: 'Dashain ko hardik shubhakamana',
    },
    subline: {
      ne: 'परिवारसँगको माया र ठूलाबडाको आशीर्वाद सधैँ रहिरहोस्।',
      en: 'May the love of family and the blessings of elders always be with you.',
    },
  },
  {
    id: 'far-from-home',
    days: ['dashain'],
    greeting: {
      ne: 'टाढा भए पनि मन घरमै छ — दशैंको शुभकामना',
      en: 'Far from home, close at heart — Happy Dashain',
    },
    subline: {
      ne: 'जहाँ रहे पनि हाम्रो संस्कृति र परिवारको माया सँगै छ।',
      en: 'Wherever we are, our culture and our family’s love travel with us.',
    },
  },

  // ── Ghatasthapana ────────────────────────────────────────────────────────
  {
    id: 'ghatasthapana-1',
    days: ['ghatasthapana'],
    greeting: {
      ne: 'घटस्थापनाको हार्दिक शुभकामना',
      en: 'Happy Ghatasthapana',
    },
    subline: {
      ne: 'माता दुर्गा भवानीको कृपाले सबैको घरमा सुख र समृद्धि छाओस्।',
      en: 'May Goddess Durga bless every home with happiness and prosperity.',
    },
  },
  {
    id: 'ghatasthapana-2',
    days: ['ghatasthapana', 'navaratri'],
    greeting: {
      ne: 'नवरात्रिको पावन अवसरमा शुभकामना',
      en: 'Blessings on the sacred Navaratri',
    },
    subline: {
      ne: 'जमराझैँ सबैको जीवन हरियो र फलदायी होस्।',
      en: 'Like the jamara, may your life grow green and fruitful.',
    },
  },

  // ── Navaratri ────────────────────────────────────────────────────────────
  {
    id: 'navaratri-1',
    days: ['navaratri'],
    greeting: {
      ne: 'शुभ नवरात्रि',
      en: 'Shubha Navaratri',
    },
    subline: {
      ne: 'नवदुर्गाको आशीर्वादले सबैमा शक्ति, बुद्धि र साहस मिलोस्।',
      en: 'May the nine forms of Durga grant you strength, wisdom and courage.',
    },
  },

  // ── Fulpati ──────────────────────────────────────────────────────────────
  {
    id: 'fulpati-1',
    days: ['fulpati'],
    greeting: {
      ne: 'फूलपातीको हार्दिक शुभकामना',
      en: 'Happy Fulpati',
    },
    subline: {
      ne: 'पवित्र फूलपातीसँगै सबैको घरमा मंगल भित्रियोस्।',
      en: 'As the sacred Fulpati arrives, may auspiciousness enter every home.',
    },
  },

  // ── Maha Ashtami ─────────────────────────────────────────────────────────
  {
    id: 'ashtami-1',
    days: ['maha-ashtami'],
    greeting: {
      ne: 'महाअष्टमीको हार्दिक शुभकामना',
      en: 'Happy Maha Ashtami',
    },
    subline: {
      ne: 'माता दुर्गा भवानीले सबैको रक्षा गरून्।',
      en: 'May Mother Durga protect you and your loved ones.',
    },
  },

  // ── Maha Navami ──────────────────────────────────────────────────────────
  {
    id: 'navami-1',
    days: ['maha-navami'],
    greeting: {
      ne: 'महानवमीको हार्दिक शुभकामना',
      en: 'Happy Maha Navami',
    },
    subline: {
      ne: 'माता सिद्धिदात्रीको कृपाले सबैका मनोकामना पूरा होऊन्।',
      en: 'By the grace of Mother Siddhidatri, may every heartfelt wish be fulfilled.',
    },
  },

  // ── Bijaya Dashami ───────────────────────────────────────────────────────
  {
    id: 'dashami-1',
    days: ['bijaya-dashami', 'dashain'],
    greeting: {
      ne: 'विजया दशमी {year} को हार्दिक मंगलमय शुभकामना',
      en: 'Happy Bijaya Dashami {year}',
    },
    subline: {
      ne: 'असत्यमाथि सत्यको विजयको यो पर्वले सबैको जीवनमा सुख, शान्ति र समृद्धि ल्याओस्।',
      en: 'May this festival of the victory of good over evil fill your life with joy, peace and prosperity.',
    },
  },
  {
    id: 'dashami-tika',
    days: ['bijaya-dashami'],
    greeting: {
      ne: 'विजया दशमीको हार्दिक शुभकामना',
      en: 'Bijaya Dashami ko hardik shubhakamana',
    },
    subline: {
      // The traditional mantra recited while offering tika (Devi Mahatmya / Argala Stotra).
      ne: 'जयन्ती मङ्गला काली भद्रकाली कपालिनी ।\nदुर्गा क्षमा शिवा धात्री स्वाहा स्वधा नमोऽस्तु ते ॥',
      en: 'With tika, jamara and the blessings of our elders — wishing you a long, healthy and prosperous life.',
    },
  },
  {
    id: 'dashami-elders',
    days: ['bijaya-dashami'],
    greeting: {
      ne: 'टीका, जमरा र आशीर्वादको शुभकामना',
      en: 'Tika, jamara and blessings to you',
    },
    subline: {
      ne: 'ठूलाबडाको आशीर्वाद र परिवारको मायाले सधैँ हाम्रो बाटो उज्यालो बनाओस्।',
      en: 'May the blessings of our elders and the love of family always light our path.',
    },
  },

  // ── Kojagrat Purnima ─────────────────────────────────────────────────────
  {
    id: 'kojagrat-1',
    days: ['kojagrat-purnima'],
    greeting: {
      ne: 'कोजाग्रत पूर्णिमाको हार्दिक शुभकामना',
      en: 'Happy Kojagrat Purnima',
    },
    subline: {
      ne: 'माता लक्ष्मीको कृपा सबैको घरमा सदा रहोस्।',
      en: 'May Goddess Laxmi’s grace remain in your home always.',
    },
  },
];

/** Greetings for a day: day-specific first, then general Dashain ones. */
export function greetingsForDay(day: DayId): Greeting[] {
  const specific = GREETINGS.filter((g) => g.days.includes(day));
  const general = GREETINGS.filter((g) => g.days.includes('dashain') && !g.days.includes(day));
  return [...specific, ...general];
}

/** Fill `{year}` with the current BS year in the right script. */
export function fillGreeting(text: string, lang: Lang, adYear = new Date().getFullYear()): string {
  const year = bsYear(adYear);
  return text.replaceAll('{year}', lang === 'ne' ? toNepaliDigits(year) : String(year));
}
