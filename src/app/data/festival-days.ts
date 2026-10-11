import type { DayId, FestivalDay } from '../models/festival.model';

/**
 * The days of Bada Dashain.
 * Descriptions are intentionally short, factual and devotional in tone.
 * Have a family elder or priest (purohit) review any additions.
 */
export const FESTIVAL_DAYS: readonly FestivalDay[] = [
  {
    id: 'dashain',
    dayNumber: 0,
    name: { ne: 'बडा दशैं', en: 'Bada Dashain' },
    description: {
      ne: 'नेपालीहरूको सबैभन्दा ठूलो चाड — परिवार भेला हुने, आशीर्वाद लिने र दिने पन्ध्र दिने पर्व।',
      en: 'The greatest festival of Nepal — fifteen days of family reunion, blessings and the victory of good over evil.',
    },
    motif: 'tika',
    accent: '#B3121F',
  },
  {
    id: 'ghatasthapana',
    dayNumber: 1,
    name: { ne: 'घटस्थापना', en: 'Ghatasthapana' },
    description: {
      ne: 'दशैंको पहिलो दिन। पवित्र कलश स्थापना गरी दुर्गा भवानीको आह्वान गरिन्छ र जमरा रोपिन्छ।',
      en: 'Day one. A sacred kalash is established to invoke Goddess Durga, and jamara seeds are sown.',
    },
    motif: 'kalash',
    accent: '#C2410C',
  },
  {
    id: 'navaratri',
    dayNumber: 2,
    name: { ne: 'नवरात्रि', en: 'Navaratri' },
    description: {
      ne: 'नौ रात दुर्गाका नौ रूप — नवदुर्गाको आराधना। बिहानै शक्तिपीठ दर्शन र जमराको स्याहार।',
      en: 'Nine nights honouring the nine forms of Durga (Navadurga), with morning temple visits and care of the jamara.',
    },
    motif: 'diyo',
    accent: '#D97706',
  },
  {
    id: 'fulpati',
    dayNumber: 7,
    name: { ne: 'फूलपाती', en: 'Fulpati' },
    description: {
      ne: 'सातौँ दिन। गोरखाबाट ल्याइएका पवित्र फूल, पात र जमरा हनुमानढोका भित्र्याइन्छ।',
      en: 'Day seven. Sacred flowers, leaves and jamara are brought from Gorkha to Hanuman Dhoka in a grand procession.',
    },
    motif: 'marigold',
    accent: '#EA8A00',
  },
  {
    id: 'maha-ashtami',
    dayNumber: 8,
    name: { ne: 'महाअष्टमी', en: 'Maha Ashtami' },
    description: {
      ne: 'आठौँ दिन। माता दुर्गा र महाकालीको विशेष पूजा गरिन्छ; राति कालरात्रि मनाइन्छ।',
      en: 'Day eight. Special worship of Goddess Durga and Mahakali; the night is observed as Kalratri.',
    },
    motif: 'trishul',
    accent: '#9F1239',
  },
  {
    id: 'maha-navami',
    dayNumber: 9,
    name: { ne: 'महानवमी', en: 'Maha Navami' },
    description: {
      ne: 'नवौँ दिन। माता सिद्धिदात्रीको पूजा, विश्वकर्मा पूजा र वर्षमा एकपटक तलेजु भवानीको दर्शन।',
      en: 'Day nine. Worship of Siddhidatri and of tools and vehicles (Vishwakarma puja); Taleju Bhawani opens to devotees once a year.',
    },
    motif: 'lotus',
    accent: '#7C2D12',
  },
  {
    id: 'bijaya-dashami',
    dayNumber: 10,
    name: { ne: 'विजया दशमी', en: 'Bijaya Dashami' },
    description: {
      ne: 'दशौँ दिन। ठूलाबडाको हातबाट टीका, जमरा र आशीर्वाद ग्रहण गरिन्छ — असत्यमाथि सत्यको विजय।',
      en: 'Day ten. Tika, jamara and blessings are received from elders — the victory of truth over evil.',
    },
    motif: 'jamara',
    accent: '#B3121F',
  },
  {
    id: 'kojagrat-purnima',
    dayNumber: 15,
    name: { ne: 'कोजाग्रत पूर्णिमा', en: 'Kojagrat Purnima' },
    description: {
      ne: 'पन्ध्रौँ दिन, दशैंको समापन। पूर्णिमाको रात जाग्राम बसी माता लक्ष्मीको पूजा गरिन्छ।',
      en: 'Day fifteen, the close of Dashain. Goddess Laxmi is worshipped through the full-moon night.',
    },
    motif: 'moon',
    accent: '#A16207',
  },
];

export function getDay(id: DayId): FestivalDay {
  return FESTIVAL_DAYS.find((d) => d.id === id) ?? FESTIVAL_DAYS[0];
}

/**
 * Gregorian dates per year (Nepal time). Lunar — UPDATE EVERY YEAR from the
 * official holiday list / Nepal Panchanga Nirnayak Samiti.
 * 2026 (BS 2083) verified Oct 2026.
 */
export const DASHAIN_DATES: Record<number, Partial<Record<DayId, string>>> = {
  2026: {
    ghatasthapana: '2026-10-11',
    fulpati: '2026-10-17',
    'maha-ashtami': '2026-10-18',
    'maha-navami': '2026-10-20',
    'bijaya-dashami': '2026-10-21',
    'kojagrat-purnima': '2026-10-25',
  },
};

/** Bikram Sambat year shown on cards (BS ≈ AD + 57 during Dashain). */
export function bsYear(adYear = new Date().getFullYear()): number {
  return adYear + 57;
}

/**
 * Which festival day is "today" (Nepal time), so the home page can feature it.
 * Days between named days fall into Navaratri / general Dashain.
 */
export function currentFestivalDay(now = new Date()): DayId | null {
  const nepal = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
  const iso = `${nepal.getFullYear()}-${String(nepal.getMonth() + 1).padStart(2, '0')}-${String(nepal.getDate()).padStart(2, '0')}`;
  const dates = DASHAIN_DATES[nepal.getFullYear()];
  if (!dates) return null;

  const exact = (Object.entries(dates) as [DayId, string][]).find(([, d]) => d === iso);
  if (exact) return exact[0];

  const start = dates.ghatasthapana;
  const fulpati = dates.fulpati;
  const end = dates['kojagrat-purnima'];
  if (start && fulpati && iso > start && iso < fulpati) return 'navaratri';
  if (start && end && iso > start && iso < end) return 'dashain';
  return null;
}

/** Devanagari digits for Nepali display. */
export function toNepaliDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => '०१२३४५६७८९'[Number(d)]);
}
