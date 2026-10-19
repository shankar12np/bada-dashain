import type { DayId } from '../models/festival.model';
import type { CardTemplate, Palette, TextSlot } from '../models/template.model';

/**
 * Template catalogue. Coordinates are on the 1080 × 1350 base canvas.
 * To add a template: copy one, change the id, tweak layers. That's it.
 * Template ids are stored on cards, so NEVER rename an existing id.
 */

// ─── palettes (deep red, gold, saffron, green, cream) ─────────────────────
const ROYAL: Palette = {
  bg: ['#8E0E1A', '#6B0A13', '#3F050B'],
  primary: '#B3121F',
  gold: '#D9A93F',
  accent: '#F59E0B',
  green: '#4D7C0F',
  cream: '#FBF3E4',
  text: '#F7D88B',
  subtext: '#FBF3E4',
};

const CREAM: Palette = {
  bg: ['#FFF9EE', '#FBEFD9', '#F4E0BC'],
  primary: '#A3111C',
  gold: '#B8862B',
  accent: '#EA8A00',
  green: '#4D7C0F',
  cream: '#FFF9EE',
  text: '#8E0E1A',
  subtext: '#5B3A1E',
};

const SAFFRON: Palette = {
  bg: ['#F59E0B', '#E2621B', '#A3111C'],
  primary: '#8E0E1A',
  gold: '#FDE68A',
  accent: '#FBBF24',
  green: '#3F6212',
  cream: '#FFF7E6',
  text: '#FFF7E6',
  subtext: '#FFF1D6',
};

const NIGHT: Palette = {
  bg: ['#2A0A10', '#1A0609', '#0D0305'],
  primary: '#9F1239',
  gold: '#E0B04F',
  accent: '#F59E0B',
  green: '#4D7C0F',
  cream: '#FBF3E4',
  text: '#F7D88B',
  subtext: '#EADBC0',
};

const PURNIMA: Palette = {
  bg: ['#1B1F3B', '#2A1F45', '#4A1F2E'],
  primary: '#9F1239',
  gold: '#EBC46A',
  accent: '#F59E0B',
  green: '#4D7C0F',
  cream: '#FBF3E4',
  text: '#F7E2A8',
  subtext: '#EDE4D3',
};

const MODERN: Palette = {
  bg: ['#FFFBF4', '#FFF4E2'],
  primary: '#B3121F',
  gold: '#C08A2E',
  accent: '#F08A00',
  green: '#3F6212',
  cream: '#FFFBF4',
  text: '#1F1410',
  subtext: '#5B4636',
};

// ─── shared text layouts ──────────────────────────────────────────────────
function textBlock(y: number, color: string, sub: string, opts: Partial<TextSlot> = {}) {
  return {
    greeting: { x: 90, y, width: 900, fontSize: 64, align: 'center' as const, font: 'display' as const, color, ...opts },
    subline: { x: 130, y: y + 170, width: 820, fontSize: 30, align: 'center' as const, font: 'body' as const, color: sub },
    from: { x: 130, y: y + 290, width: 820, fontSize: 30, align: 'center' as const, font: 'script' as const, color: sub },
  };
}

const ALL: DayId[] = ['dashain'];
/** Every festival day — used by designs that should be offered first everywhere. */
const EVERY: DayId[] = ['dashain', 'ghatasthapana', 'navaratri', 'fulpati', 'maha-ashtami', 'maha-navami', 'bijaya-dashami', 'kojagrat-purnima'];

export const TEMPLATES: readonly CardTemplate[] = [
  // ── Bijaya Dashami posters: full-bleed photo + Tika thali + Durga artwork ───
  // Artwork sits in framed panels in the corners/edges, where a portrait's
  // background usually is — never over the middle of the photo.

  // B1 ── Dashami Ashirbad: Durga top-left, Tika thali top-right, photo fills the card
  {
    id: 'dashami-ashirbad',
    name: { ne: 'दशमीको आशीर्वाद', en: 'Dashami Ashirbad' },
    style: 'traditional',
    days: ['bijaya-dashami'],
    palette: ROYAL,
    background: [],
    photo: { shape: 'rect', cx: 540, cy: 675, width: 1080, height: 1350, border: { color: ROYAL.gold, width: 0 }, halo: false },
    foreground: [
      { kind: 'light-leak', x: 540, y: 60, r: 620, color: 'rgba(255,170,60,1)', opacity: 0.4 },
      { kind: 'vignette', strength: 0.45 },
      { kind: 'fade', y0: 0, y1: 380, stops: [[0, 'rgba(58,5,10,0.8)'], [1, 'rgba(58,5,10,0)']] },
      { kind: 'fade', y0: 800, y1: 1350, stops: [[0, 'rgba(50,4,8,0)'], [0.45, 'rgba(50,4,8,0.8)'], [1, 'rgba(38,3,6,0.97)']] },
      { kind: 'bokeh', count: 34, colors: ['rgba(255,214,120,0.9)', 'rgba(255,170,70,0.8)', 'rgba(255,242,205,0.95)'], area: { x: 280, y: 60, w: 520, h: 230 }, seed: 12 },
      { kind: 'garland', y: 40, sag: 56, color: '#F59E0B', leaf: '#4D7C0F' },
      { kind: 'border', inset: 26, color: ROYAL.gold, width: 3, double: true, corners: true },
      { kind: 'image', src: 'art/durga.jpg', x: 66, y: 94, width: 186, height: 279, frame: { color: ROYAL.gold, width: 8 } },
      { kind: 'image', src: 'art/thali.jpg', x: 744, y: 140, width: 270, height: 180, fit: 'contain', frame: { color: ROYAL.gold, width: 8 } },
      { kind: 'jamara', x: 110, y: 1300, width: 120, height: 230, color: '#C3D35A', count: 26 },
      { kind: 'jamara', x: 970, y: 1300, width: 120, height: 230, color: '#C3D35A', count: 26 },
    ],
    text: {
      greeting: { x: 170, y: 965, width: 740, fontSize: 62, align: 'center', font: 'display', color: '#F7D88B', shadow: true },
      subline: { x: 190, y: 1105, width: 700, fontSize: 26, align: 'center', font: 'body', color: '#FBF3E4', shadow: true },
      from: { x: 190, y: 1205, width: 700, fontSize: 32, align: 'center', font: 'script', color: '#F7D88B', shadow: true },
    },
  },

  // B2 ── Tika Prasad: photo fills the top, the Tika thali presented below it
  {
    id: 'tika-prasad',
    name: { ne: 'टीका प्रसाद', en: 'Tika Prasad' },
    style: 'traditional',
    days: ['bijaya-dashami'],
    palette: ROYAL,
    background: [
      { kind: 'sun-rays', cx: 540, cy: 1100, r: 900, color: ROYAL.gold, opacity: 0.1, count: 40 },
      { kind: 'pattern-dhaka', y: 1310, height: 40, colors: ['#3F050B', ROYAL.primary, ROYAL.gold, ROYAL.accent] },
    ],
    photo: { shape: 'rect', cx: 540, cy: 470, width: 1080, height: 940, border: { color: ROYAL.gold, width: 0 }, halo: false },
    foreground: [
      { kind: 'light-leak', x: 1000, y: 90, r: 520, color: 'rgba(255,180,70,1)', opacity: 0.42 },
      { kind: 'fade', y0: 0, y1: 260, stops: [[0, 'rgba(58,5,10,0.75)'], [1, 'rgba(58,5,10,0)']] },
      { kind: 'fade', y0: 640, y1: 940, stops: [[0, 'rgba(63,5,11,0)'], [1, 'rgba(63,5,11,1)']] },
      { kind: 'bokeh', count: 30, colors: ['rgba(255,214,120,0.9)', 'rgba(255,242,205,0.95)'], area: { x: 0, y: 60, w: 1080, h: 220 }, seed: 17 },
      { kind: 'toran', y: 22, colors: ['#3F6212', '#F59E0B', '#7C2D12'] },
      { kind: 'border', inset: 26, color: ROYAL.gold, width: 3, double: true, corners: true },
      { kind: 'image', src: 'art/thali.jpg', x: 60, y: 830, width: 330, height: 330, fit: 'contain', frame: { color: ROYAL.gold, width: 8 } },
      { kind: 'diyo', x: 225, y: 1240, size: 36, color: '#B45309', flame: '#F59E0B' },
      { kind: 'marigold', x: 980, y: 1250, r: 30, color: '#F59E0B' },
    ],
    text: {
      greeting: { x: 420, y: 905, width: 610, fontSize: 52, align: 'center', font: 'display', color: ROYAL.text },
      subline: { x: 430, y: 1045, width: 590, fontSize: 23, align: 'center', font: 'body', color: ROYAL.subtext },
      from: { x: 430, y: 1185, width: 590, fontSize: 30, align: 'center', font: 'script', color: ROYAL.text },
    },
  },

  // B3 ── Durga Kripa: full-bleed photo, a tall Durga panel blessing from the side
  {
    id: 'durga-kripa',
    name: { ne: 'दुर्गा कृपा', en: 'Durga Kripa' },
    style: 'traditional',
    days: ['bijaya-dashami'],
    palette: NIGHT,
    background: [],
    photo: { shape: 'rect', cx: 540, cy: 675, width: 1080, height: 1350, border: { color: NIGHT.gold, width: 0 }, halo: false },
    foreground: [
      { kind: 'vignette', strength: 0.6, color: '20,4,6' },
      { kind: 'light-leak', x: 160, y: 1000, r: 520, color: 'rgba(255,150,50,1)', opacity: 0.4 },
      { kind: 'fade', y0: 760, y1: 1350, stops: [[0, 'rgba(20,4,6,0)'], [0.45, 'rgba(20,4,6,0.82)'], [1, 'rgba(14,3,4,0.97)']] },
      { kind: 'bokeh', count: 36, colors: ['rgba(255,200,100,0.85)', 'rgba(255,240,200,0.9)'], area: { x: 0, y: 50, w: 1080, h: 280 }, seed: 31 },
      { kind: 'garland', y: 40, sag: 56, color: '#F59E0B', leaf: '#4D7C0F' },
      { kind: 'border', inset: 26, color: NIGHT.gold, width: 3, double: true, corners: true },
      { kind: 'image', src: 'art/durga.jpg', x: 72, y: 860, width: 250, height: 375, frame: { color: NIGHT.gold, width: 9 } },
      { kind: 'diyo', x: 820, y: 1268, size: 32, color: '#9A3412', flame: '#F59E0B' },
      { kind: 'diyo', x: 960, y: 1268, size: 32, color: '#9A3412', flame: '#F59E0B' },
      { kind: 'tika', x: 680, y: 1268, r: 13, color: '#C1121F' },
    ],
    text: {
      greeting: { x: 360, y: 920, width: 670, fontSize: 56, align: 'center', font: 'display', color: '#F7D88B', shadow: true },
      subline: { x: 370, y: 1060, width: 650, fontSize: 24, align: 'center', font: 'body', color: '#F3E7D3', shadow: true },
      from: { x: 370, y: 1170, width: 650, fontSize: 30, align: 'center', font: 'script', color: '#F7D88B', shadow: true },
    },
  },

  // ── Poster designs: the person's photo fills the whole card ─────────────────
  // Festive light, garlands and gold are layered OVER the photo, and the greeting
  // sits on a soft dark fade at the bottom so it always reads clearly.

  // P1 ── Vijaya Utsav: full-bleed photo, warm festival glow, marigold garland
  {
    id: 'vijaya-poster',
    name: { ne: 'विजय उत्सव', en: 'Vijaya Utsav' },
    style: 'traditional',
    days: EVERY,
    palette: ROYAL,
    background: [],
    photo: { shape: 'rect', cx: 540, cy: 675, width: 1080, height: 1350, border: { color: ROYAL.gold, width: 0 }, halo: false },
    foreground: [
      { kind: 'light-leak', x: 1000, y: 110, r: 560, color: 'rgba(255,176,64,1)', opacity: 0.5 },
      { kind: 'light-leak', x: 60, y: 1180, r: 460, color: 'rgba(255,96,40,1)', opacity: 0.32 },
      { kind: 'vignette', strength: 0.42 },
      { kind: 'fade', y0: 0, y1: 300, stops: [[0, 'rgba(58,5,10,0.85)'], [1, 'rgba(58,5,10,0)']] },
      { kind: 'fade', y0: 780, y1: 1350, stops: [[0, 'rgba(50,4,8,0)'], [0.45, 'rgba(50,4,8,0.78)'], [1, 'rgba(38,3,6,0.97)']] },
      { kind: 'bokeh', count: 46, colors: ['rgba(255,214,120,0.9)', 'rgba(255,170,70,0.8)', 'rgba(255,242,205,0.95)'], area: { x: 0, y: 70, w: 1080, h: 300 }, seed: 5 },
      { kind: 'garland', y: 44, sag: 64, color: '#F59E0B', leaf: '#4D7C0F' },
      { kind: 'border', inset: 26, color: ROYAL.gold, width: 3, double: true, corners: true },
      { kind: 'diyo', x: 125, y: 1258, size: 38, color: '#B45309', flame: '#F59E0B' },
      { kind: 'diyo', x: 955, y: 1258, size: 38, color: '#B45309', flame: '#F59E0B' },
    ],
    text: {
      greeting: { x: 90, y: 955, width: 900, fontSize: 66, align: 'center', font: 'display', color: '#F7D88B', shadow: true },
      subline: { x: 130, y: 1100, width: 820, fontSize: 28, align: 'center', font: 'body', color: '#FBF3E4', shadow: true },
      from: { x: 130, y: 1205, width: 820, fontSize: 32, align: 'center', font: 'script', color: '#F7D88B', shadow: true },
    },
  },

  // P2 ── Swarna Dwar: a grand golden arch, the photo almost the full card
  {
    id: 'swarna-dwar',
    name: { ne: 'स्वर्ण द्वार', en: 'Swarna Dwar' },
    style: 'traditional',
    days: EVERY,
    palette: ROYAL,
    background: [
      { kind: 'sun-rays', cx: 540, cy: 560, r: 1100, color: ROYAL.gold, opacity: 0.1, count: 44 },
      { kind: 'mandala', cx: 540, cy: 560, r: 540, color: ROYAL.gold, opacity: 0.14, petals: 24 },
      { kind: 'pattern-dhaka', y: 1310, height: 40, colors: ['#3F050B', ROYAL.primary, ROYAL.gold, ROYAL.accent] },
    ],
    photo: { shape: 'arch', cx: 540, cy: 548, width: 900, height: 950, border: { color: ROYAL.gold, width: 12, double: true } },
    foreground: [
      { kind: 'light-leak', x: 900, y: 160, r: 420, color: 'rgba(255,190,80,1)', opacity: 0.35 },
      { kind: 'bokeh', count: 26, colors: ['rgba(255,220,130,0.9)', 'rgba(255,245,210,0.95)'], area: { x: 40, y: 40, w: 1000, h: 300 }, seed: 9 },
      { kind: 'garland', y: 70, sag: 40, color: '#F59E0B', leaf: '#4D7C0F' },
      { kind: 'marigold', x: 90, y: 1010, r: 38, color: '#F59E0B' },
      { kind: 'marigold', x: 990, y: 1010, r: 38, color: '#EA580C' },
      { kind: 'diyo', x: 95, y: 1150, size: 34, color: '#B45309', flame: '#F59E0B' },
      { kind: 'diyo', x: 985, y: 1150, size: 34, color: '#B45309', flame: '#F59E0B' },
    ],
    text: {
      greeting: { x: 150, y: 1072, width: 780, fontSize: 52, align: 'center', font: 'display', color: ROYAL.text },
      subline: { x: 170, y: 1160, width: 740, fontSize: 23, align: 'center', font: 'body', color: ROYAL.subtext },
      from: { x: 170, y: 1235, width: 740, fontSize: 28, align: 'center', font: 'script', color: ROYAL.text },
    },
  },

  // P3 ── Deep Jyoti: full-bleed photo at night, a row of diyos, lots of glow
  {
    id: 'deep-jyoti',
    name: { ne: 'दीप ज्योति', en: 'Deep Jyoti' },
    style: 'traditional',
    days: EVERY,
    palette: NIGHT,
    background: [],
    photo: { shape: 'rect', cx: 540, cy: 675, width: 1080, height: 1350, border: { color: NIGHT.gold, width: 0 }, halo: false },
    foreground: [
      { kind: 'vignette', strength: 0.7, color: '20,4,6' },
      { kind: 'light-leak', x: 540, y: 1350, r: 700, color: 'rgba(255,140,40,1)', opacity: 0.45 },
      { kind: 'fade', y0: 760, y1: 1350, stops: [[0, 'rgba(20,4,6,0)'], [0.5, 'rgba(20,4,6,0.8)'], [1, 'rgba(14,3,4,0.96)']] },
      { kind: 'bokeh', count: 40, colors: ['rgba(255,200,100,0.85)', 'rgba(255,150,60,0.75)', 'rgba(255,240,200,0.9)'], area: { x: 0, y: 40, w: 1080, h: 330 }, seed: 21 },
      { kind: 'bokeh', count: 18, colors: ['rgba(255,190,90,0.8)', 'rgba(255,240,200,0.9)'], area: { x: 0, y: 880, w: 1080, h: 360 }, seed: 8 },
      { kind: 'border', inset: 30, color: NIGHT.gold, width: 2, double: true },
      { kind: 'diyo', x: 170, y: 1262, size: 34, color: '#9A3412', flame: '#F59E0B' },
      { kind: 'diyo', x: 340, y: 1268, size: 30, color: '#9A3412', flame: '#F59E0B' },
      { kind: 'diyo', x: 740, y: 1268, size: 30, color: '#9A3412', flame: '#F59E0B' },
      { kind: 'diyo', x: 910, y: 1262, size: 34, color: '#9A3412', flame: '#F59E0B' },
    ],
    text: {
      greeting: { x: 90, y: 965, width: 900, fontSize: 64, align: 'center', font: 'display', color: '#F7D88B', shadow: true },
      subline: { x: 130, y: 1105, width: 820, fontSize: 27, align: 'center', font: 'body', color: '#F3E7D3', shadow: true },
      from: { x: 130, y: 1195, width: 820, fontSize: 32, align: 'center', font: 'script', color: '#F7D88B', shadow: true },
    },
  },

  // P4 ── Jamara Prabhat: photo fills the top, melting into cream with jamara
  {
    id: 'jamara-prabhat',
    name: { ne: 'जमरा प्रभात', en: 'Jamara Prabhat' },
    style: 'traditional',
    days: EVERY,
    palette: { ...CREAM, bg: ['#FFF9EE', '#FBEFD9'] },
    background: [],
    photo: { shape: 'rect', cx: 540, cy: 500, width: 1080, height: 1000, border: { color: CREAM.gold, width: 0 }, halo: false },
    foreground: [
      { kind: 'light-leak', x: 80, y: 80, r: 520, color: 'rgba(255,200,110,1)', opacity: 0.45 },
      { kind: 'fade', y0: 600, y1: 1000, stops: [[0, 'rgba(255,249,238,0)'], [0.7, 'rgba(255,249,238,0.85)'], [1, 'rgba(255,249,238,1)']] },
      { kind: 'fade', y0: 1000, y1: 1350, stops: [[0, 'rgba(255,249,238,1)'], [1, 'rgba(251,239,217,1)']] },
      { kind: 'bokeh', count: 22, colors: ['rgba(255,225,150,0.9)', 'rgba(255,250,230,0.95)'], area: { x: 0, y: 60, w: 1080, h: 280 }, seed: 3 },
      { kind: 'toran', y: 24, colors: ['#3F6212', '#F59E0B', '#7C2D12'] },
      { kind: 'border', inset: 22, color: CREAM.primary, width: 4, double: true, corners: true },
      { kind: 'jamara', x: 110, y: 1300, width: 140, height: 300, color: '#C3D35A', count: 32 },
      { kind: 'jamara', x: 970, y: 1300, width: 140, height: 300, color: '#C3D35A', count: 32 },
      { kind: 'tika', x: 540, y: 905, r: 16, color: '#C1121F' },
    ],
    text: {
      greeting: { x: 170, y: 935, width: 740, fontSize: 60, align: 'center', font: 'display', color: CREAM.text },
      subline: { x: 200, y: 1080, width: 680, fontSize: 26, align: 'center', font: 'body', color: CREAM.subtext },
      from: { x: 200, y: 1190, width: 680, fontSize: 30, align: 'center', font: 'script', color: CREAM.primary },
    },
  },

  // ── Devotional templates (artwork: public/art/durga.jpg) ───────────────────
  // Layout rule: the Goddess is always framed on her own, at the top, never
  // cropped and never overlapped by the user's photo or by text.

  // D1 ── Durga Darshan: shrine panel on top, the person's photo large below
  {
    id: 'durga-darshan',
    name: { ne: 'दुर्गा दर्शन', en: 'Durga Darshan' },
    style: 'traditional',
    days: ['bijaya-dashami', 'maha-ashtami', 'maha-navami', 'navaratri', 'ghatasthapana', 'dashain'],
    palette: ROYAL,
    background: [
      { kind: 'sun-rays', cx: 540, cy: 760, r: 1000, color: ROYAL.gold, opacity: 0.07, count: 40 },
      { kind: 'mandala', cx: 540, cy: 760, r: 330, color: ROYAL.gold, opacity: 0.14, petals: 20 },
      { kind: 'pattern-dhaka', y: 0, height: 44, colors: ['#3F050B', ROYAL.primary, ROYAL.gold, ROYAL.accent] },
      { kind: 'pattern-dhaka', y: 1306, height: 44, colors: ['#3F050B', ROYAL.primary, ROYAL.gold, ROYAL.accent] },
      { kind: 'border', inset: 60, color: ROYAL.gold, width: 3, double: true, corners: true },
      { kind: 'grain', opacity: 0.05 },
      { kind: 'image', src: 'art/durga.jpg', x: 400, y: 78, width: 280, height: 420, frame: { color: ROYAL.gold, width: 10 } },
      // Ghatasthapana kalash on the left, Dashami jamara on the right.
      { kind: 'kalash', x: 250, y: 400, size: 86, color: '#C9A227', accent: '#8E0E1A', leaf: '#3F6212' },
      { kind: 'jamara', x: 830, y: 470, width: 120, height: 230, color: '#C3D35A', count: 28 },
    ],
    photo: { shape: 'circle', cx: 540, cy: 765, width: 430, height: 430, border: { color: ROYAL.gold, width: 10, double: true } },
    foreground: [
      { kind: 'diyo', x: 205, y: 900, size: 44, color: '#B45309', flame: '#F59E0B' },
      { kind: 'diyo', x: 875, y: 900, size: 44, color: '#B45309', flame: '#F59E0B' },
    ],
    text: {
      greeting: { x: 120, y: 1012, width: 840, fontSize: 48, align: 'center', font: 'display', color: ROYAL.text },
      subline: { x: 150, y: 1130, width: 780, fontSize: 23, align: 'center', font: 'body', color: ROYAL.subtext },
      from: { x: 150, y: 1215, width: 780, fontSize: 28, align: 'center', font: 'script', color: ROYAL.text },
    },
  },

  // D3 ── Tika Thali: artwork public/art/thali.jpg (any shape — fitted, never cropped)
  {
    id: 'tika-thali',
    name: { ne: 'टीका थाली', en: 'Tika Thali' },
    style: 'traditional',
    days: ['bijaya-dashami'],
    palette: ROYAL,
    background: [
      { kind: 'sun-rays', cx: 540, cy: 720, r: 1000, color: ROYAL.gold, opacity: 0.08, count: 40 },
      { kind: 'mandala', cx: 540, cy: 720, r: 330, color: ROYAL.gold, opacity: 0.14 },
      { kind: 'pattern-dhaka', y: 0, height: 44, colors: ['#3F050B', ROYAL.primary, ROYAL.gold, ROYAL.accent] },
      { kind: 'pattern-dhaka', y: 1306, height: 44, colors: ['#3F050B', ROYAL.primary, ROYAL.gold, ROYAL.accent] },
      { kind: 'border', inset: 60, color: ROYAL.gold, width: 3, double: true, corners: true },
      { kind: 'grain', opacity: 0.05 },
      { kind: 'image', src: 'art/thali.jpg', x: 310, y: 84, width: 460, height: 360, fit: 'contain', frame: { color: ROYAL.gold, width: 10 } },
    ],
    photo: { shape: 'circle', cx: 540, cy: 720, width: 440, height: 440, border: { color: ROYAL.gold, width: 10, double: true } },
    foreground: [
      { kind: 'diyo', x: 205, y: 860, size: 44, color: '#B45309', flame: '#F59E0B' },
      { kind: 'diyo', x: 875, y: 860, size: 44, color: '#B45309', flame: '#F59E0B' },
    ],
    text: {
      greeting: { x: 120, y: 980, width: 840, fontSize: 50, align: 'center', font: 'display', color: ROYAL.text },
      subline: { x: 150, y: 1105, width: 780, fontSize: 24, align: 'center', font: 'body', color: ROYAL.subtext },
      from: { x: 150, y: 1205, width: 780, fontSize: 28, align: 'center', font: 'script', color: ROYAL.text },
    },
  },

  // D4 ── Utsav: wide (landscape) artwork public/art/utsav.jpg across the top
  {
    id: 'utsav',
    name: { ne: 'उत्सव', en: 'Utsav' },
    style: 'traditional',
    days: ['bijaya-dashami'],
    palette: CREAM,
    background: [
      { kind: 'sun-rays', cx: 540, cy: 735, r: 1000, color: '#F4D9A4', opacity: 0.45, count: 48 },
      { kind: 'border', inset: 34, color: CREAM.primary, width: 5, double: true, corners: true },
      { kind: 'grain', opacity: 0.05 },
      { kind: 'image', src: 'art/utsav.jpg', x: 240, y: 74, width: 600, height: 400, fit: 'contain', frame: { color: CREAM.gold, width: 10 } },
      { kind: 'jamara', x: 120, y: 1300, width: 130, height: 240, color: '#C3D35A', count: 28 },
      { kind: 'jamara', x: 960, y: 1300, width: 130, height: 240, color: '#C3D35A', count: 28 },
    ],
    photo: { shape: 'circle', cx: 540, cy: 735, width: 430, height: 430, border: { color: CREAM.gold, width: 10, double: true } },
    foreground: [
      { kind: 'marigold', x: 230, y: 760, r: 36, color: '#F59E0B' },
      { kind: 'marigold', x: 850, y: 760, r: 36, color: '#EA580C' },
    ],
    text: {
      greeting: { x: 150, y: 990, width: 780, fontSize: 50, align: 'center', font: 'display', color: CREAM.text },
      subline: { x: 200, y: 1110, width: 680, fontSize: 24, align: 'center', font: 'body', color: CREAM.subtext },
      from: { x: 200, y: 1200, width: 680, fontSize: 28, align: 'center', font: 'script', color: CREAM.primary },
    },
  },

  // D2 ── Ashirbad: cream, smaller shrine panel, the person's photo large below
  {
    id: 'ashirbad',
    name: { ne: 'आशीर्वाद', en: 'Ashirbad' },
    style: 'traditional',
    days: ['bijaya-dashami', 'maha-ashtami', 'maha-navami', 'navaratri', 'dashain'],
    palette: CREAM,
    background: [
      { kind: 'sun-rays', cx: 540, cy: 660, r: 900, color: '#F4D9A4', opacity: 0.5, count: 48 },
      { kind: 'border', inset: 34, color: CREAM.primary, width: 5, double: true, corners: true },
      { kind: 'grain', opacity: 0.05 },
      { kind: 'image', src: 'art/durga.jpg', x: 420, y: 60, width: 240, height: 360, frame: { color: CREAM.gold, width: 10 } },
      // Marigold strings hanging either side of the shrine.
      ...[0, 1, 2, 3, 4, 5].flatMap((i) => [
        { kind: 'marigold' as const, x: 360, y: 80 + i * 58, r: 23, color: i % 2 ? '#EA580C' : '#F59E0B' },
        { kind: 'marigold' as const, x: 720, y: 80 + i * 58, r: 23, color: i % 2 ? '#EA580C' : '#F59E0B' },
      ]),
      { kind: 'jamara', x: 120, y: 1300, width: 140, height: 280, color: '#C3D35A', count: 30 },
      { kind: 'jamara', x: 960, y: 1300, width: 140, height: 280, color: '#C3D35A', count: 30 },
    ],
    photo: { shape: 'circle', cx: 540, cy: 665, width: 440, height: 440, border: { color: CREAM.gold, width: 10, double: true } },
    foreground: [{ kind: 'tika', x: 540, y: 922, r: 14, color: '#C1121F' }],
    text: {
      greeting: { x: 160, y: 950, width: 760, fontSize: 50, align: 'center', font: 'display', color: CREAM.text },
      subline: { x: 200, y: 1080, width: 680, fontSize: 24, align: 'center', font: 'body', color: CREAM.subtext },
      from: { x: 200, y: 1185, width: 680, fontSize: 28, align: 'center', font: 'script', color: CREAM.primary },
    },
  },

  // 1 ── Rajdarbar: the flagship royal-red design ──────────────────────────
  {
    id: 'rajdarbar',
    name: { ne: 'राजदरबार', en: 'Rajdarbar' },
    style: 'traditional',
    days: [...ALL, 'bijaya-dashami', 'fulpati'],
    palette: ROYAL,
    background: [
      { kind: 'mandala', cx: 540, cy: 540, r: 470, color: ROYAL.gold, opacity: 0.16 },
      { kind: 'pattern-dhaka', y: 0, height: 56, colors: ['#3F050B', ROYAL.primary, ROYAL.gold, ROYAL.accent] },
      { kind: 'pattern-dhaka', y: 1294, height: 56, colors: ['#3F050B', ROYAL.primary, ROYAL.gold, ROYAL.accent] },
      { kind: 'border', inset: 74, color: ROYAL.gold, width: 4, double: true, corners: true },
      { kind: 'grain', opacity: 0.06 },
    ],
    photo: { shape: 'arch', cx: 540, cy: 520, width: 560, height: 640, border: { color: ROYAL.gold, width: 10, double: true } },
    foreground: [
      { kind: 'garland', y: 150, sag: 70, color: ROYAL.accent, leaf: ROYAL.green },
      { kind: 'diyo', x: 175, y: 1220, size: 52, color: '#B45309', flame: '#F59E0B' },
      { kind: 'diyo', x: 905, y: 1220, size: 52, color: '#B45309', flame: '#F59E0B' },
    ],
    text: textBlock(890, ROYAL.text, ROYAL.subtext),
  },

  // 2 ── Jamara & Tika: Bijaya Dashami on cream ────────────────────────────
  {
    id: 'jamara-tika',
    name: { ne: 'जमरा र टीका', en: 'Jamara & Tika' },
    style: 'traditional',
    days: ['bijaya-dashami', 'dashain'],
    palette: CREAM,
    background: [
      { kind: 'sun-rays', cx: 540, cy: 500, r: 900, color: '#F4D9A4', opacity: 0.45, count: 48 },
      { kind: 'border', inset: 40, color: CREAM.primary, width: 6, double: true, corners: true },
      { kind: 'jamara', x: 110, y: 1290, width: 150, height: 300, color: '#C3D35A', count: 34 },
      { kind: 'jamara', x: 970, y: 1290, width: 150, height: 300, color: '#C3D35A', count: 34 },
      { kind: 'grain', opacity: 0.05 },
    ],
    photo: { shape: 'circle', cx: 540, cy: 470, width: 560, height: 560, border: { color: CREAM.gold, width: 12, double: true } },
    foreground: [
      { kind: 'tika', x: 540, y: 130, r: 26, color: '#C1121F' },
      { kind: 'marigold', x: 335, y: 690, r: 46, color: '#F59E0B' },
      { kind: 'marigold', x: 745, y: 690, r: 46, color: '#F59E0B' },
      { kind: 'marigold', x: 540, y: 760, r: 40, color: '#EA580C' },
    ],
    text: {
      greeting: { x: 170, y: 840, width: 740, fontSize: 60, align: 'center', font: 'display', color: CREAM.text },
      subline: { x: 190, y: 1000, width: 700, fontSize: 28, align: 'center', font: 'body', color: CREAM.subtext },
      from: { x: 190, y: 1150, width: 700, fontSize: 30, align: 'center', font: 'script', color: CREAM.primary },
    },
  },

  // 3 ── Kalash Mangal: Ghatasthapana ──────────────────────────────────────
  {
    id: 'kalash-mangal',
    name: { ne: 'कलश मंगल', en: 'Kalash Mangal' },
    style: 'traditional',
    days: ['ghatasthapana', 'navaratri'],
    palette: SAFFRON,
    background: [
      { kind: 'sun-rays', cx: 540, cy: 480, r: 1100, color: '#FFF7E6', opacity: 0.12, count: 40 },
      { kind: 'mandala', cx: 540, cy: 480, r: 400, color: SAFFRON.gold, opacity: 0.25 },
      { kind: 'border', inset: 36, color: SAFFRON.gold, width: 5, double: true, corners: true },
      { kind: 'grain', opacity: 0.05 },
    ],
    photo: { shape: 'rounded', cx: 540, cy: 460, width: 560, height: 600, border: { color: SAFFRON.gold, width: 10 } },
    foreground: [
      { kind: 'toran', y: 70, colors: ['#3F6212', '#FBBF24', '#7C2D12'] },
      { kind: 'kalash', x: 540, y: 880, size: 120, color: '#C9A227', accent: '#8E0E1A', leaf: '#3F6212' },
    ],
    text: textBlock(960, SAFFRON.text, SAFFRON.subtext, { fontSize: 60 }),
  },

  // 4 ── Diyo Ujyalo: Navaratri lamps in the dark ──────────────────────────
  {
    id: 'diyo-ujyalo',
    name: { ne: 'दियो उज्यालो', en: 'Diyo Ujyalo' },
    style: 'traditional',
    days: ['navaratri', 'ghatasthapana', 'maha-ashtami', 'dashain'],
    palette: NIGHT,
    background: [
      { kind: 'mandala', cx: 540, cy: 500, r: 520, color: NIGHT.gold, opacity: 0.12, petals: 20 },
      { kind: 'border', inset: 48, color: NIGHT.gold, width: 3, double: true },
      { kind: 'grain', opacity: 0.05 },
    ],
    photo: { shape: 'circle', cx: 540, cy: 480, width: 580, height: 580, border: { color: NIGHT.gold, width: 8, double: true } },
    foreground: [
      { kind: 'diyo', x: 180, y: 820, size: 48, color: '#9A3412', flame: '#F59E0B' },
      { kind: 'diyo', x: 360, y: 830, size: 44, color: '#9A3412', flame: '#F59E0B' },
      { kind: 'diyo', x: 720, y: 830, size: 44, color: '#9A3412', flame: '#F59E0B' },
      { kind: 'diyo', x: 900, y: 820, size: 48, color: '#9A3412', flame: '#F59E0B' },
    ],
    text: textBlock(900, NIGHT.text, NIGHT.subtext),
  },

  // 5 ── Fulpati Phool: garlands of sacred flowers ─────────────────────────
  {
    id: 'fulpati-phool',
    name: { ne: 'फूलपाती', en: 'Fulpati Phool' },
    style: 'traditional',
    days: ['fulpati', 'dashain'],
    palette: CREAM,
    background: [
      { kind: 'mandala', cx: 540, cy: 520, r: 470, color: CREAM.accent, opacity: 0.14 },
      { kind: 'pattern-dhaka', y: 1290, height: 60, colors: [CREAM.primary, '#1F1410', CREAM.cream, CREAM.accent] },
      { kind: 'grain', opacity: 0.05 },
    ],
    photo: { shape: 'arch', cx: 540, cy: 540, width: 540, height: 620, border: { color: CREAM.primary, width: 8, double: true } },
    foreground: [
      { kind: 'garland', y: 40, sag: 110, color: '#F59E0B', leaf: '#4D7C0F' },
      { kind: 'garland', y: 100, sag: 60, color: '#EA580C', leaf: '#4D7C0F' },
      { kind: 'marigold', x: 70, y: 420, r: 40, color: '#F59E0B' },
      { kind: 'marigold', x: 1010, y: 420, r: 40, color: '#F59E0B' },
      { kind: 'marigold', x: 80, y: 520, r: 30, color: '#EA580C' },
      { kind: 'marigold', x: 1000, y: 520, r: 30, color: '#EA580C' },
    ],
    text: textBlock(905, CREAM.text, CREAM.subtext),
  },

  // 6 ── Shakti: Maha Ashtami ──────────────────────────────────────────────
  {
    id: 'shakti',
    name: { ne: 'शक्ति', en: 'Shakti' },
    style: 'traditional',
    days: ['maha-ashtami', 'navaratri', 'maha-navami'],
    palette: ROYAL,
    background: [
      { kind: 'sun-rays', cx: 540, cy: 470, r: 1200, color: ROYAL.gold, opacity: 0.1, count: 32 },
      { kind: 'mandala', cx: 540, cy: 470, r: 430, color: ROYAL.gold, opacity: 0.22, petals: 24 },
      { kind: 'trishul', x: 110, y: 1310, size: 190, color: ROYAL.gold },
      { kind: 'trishul', x: 970, y: 1310, size: 190, color: ROYAL.gold },
      { kind: 'border', inset: 34, color: ROYAL.gold, width: 3 },
      { kind: 'grain', opacity: 0.06 },
    ],
    photo: { shape: 'diamond-arch', cx: 540, cy: 470, width: 540, height: 640, border: { color: ROYAL.gold, width: 10, double: true } },
    foreground: [{ kind: 'tika', x: 540, y: 95, r: 22, color: '#E11D2E' }],
    text: textBlock(870, ROYAL.text, ROYAL.subtext, { x: 110, width: 860 }),
  },

  // 7 ── Siddhi Kamal: Maha Navami lotus ───────────────────────────────────
  {
    id: 'siddhi-kamal',
    name: { ne: 'सिद्धि कमल', en: 'Siddhi Kamal' },
    style: 'traditional',
    days: ['maha-navami', 'kojagrat-purnima', 'dashain'],
    palette: NIGHT,
    background: [
      { kind: 'mandala', cx: 540, cy: 480, r: 480, color: NIGHT.gold, opacity: 0.18, petals: 18 },
      { kind: 'pattern-dhaka', y: 0, height: 48, colors: ['#1A0609', NIGHT.primary, NIGHT.gold, NIGHT.accent] },
      { kind: 'pattern-dhaka', y: 1302, height: 48, colors: ['#1A0609', NIGHT.primary, NIGHT.gold, NIGHT.accent] },
      { kind: 'grain', opacity: 0.05 },
    ],
    photo: { shape: 'circle', cx: 540, cy: 470, width: 540, height: 540, border: { color: NIGHT.gold, width: 10, double: true } },
    foreground: [{ kind: 'lotus', x: 540, y: 820, size: 150, color: '#F9A8B4', accent: NIGHT.gold }],
    text: textBlock(880, NIGHT.text, NIGHT.subtext),
  },

  // 8 ── Purnima Chandra: Kojagrat Purnima ─────────────────────────────────
  {
    id: 'purnima-chandra',
    name: { ne: 'पूर्णिमा चन्द्र', en: 'Purnima Chandra' },
    style: 'traditional',
    days: ['kojagrat-purnima'],
    palette: PURNIMA,
    background: [
      { kind: 'moon', x: 540, y: 470, r: 330, color: '#F3D99A', glow: 'rgba(243,217,154,0.35)' },
      { kind: 'border', inset: 40, color: PURNIMA.gold, width: 3, double: true, corners: true },
      { kind: 'grain', opacity: 0.05 },
    ],
    photo: { shape: 'circle', cx: 540, cy: 470, width: 520, height: 520, border: { color: PURNIMA.gold, width: 8 } },
    foreground: [
      { kind: 'lotus', x: 540, y: 800, size: 120, color: '#FBCFE8', accent: PURNIMA.gold },
      { kind: 'diyo', x: 260, y: 790, size: 40, color: '#92400E', flame: '#FBBF24' },
      { kind: 'diyo', x: 820, y: 790, size: 40, color: '#92400E', flame: '#FBBF24' },
    ],
    text: textBlock(870, PURNIMA.text, PURNIMA.subtext),
  },

  // 9 ── Himalaya: modern, minimal, mountains ──────────────────────────────
  {
    id: 'himalaya',
    name: { ne: 'हिमालय', en: 'Himalaya' },
    style: 'modern',
    days: ALL,
    palette: MODERN,
    background: [
      { kind: 'mountains', y: 1170, colors: ['#F4C77E', '#E2621B', '#B3121F'], opacity: 1 },
      { kind: 'tika', x: 540, y: 100, r: 18, color: '#C1121F' },
    ],
    photo: { shape: 'rounded', cx: 540, cy: 450, width: 640, height: 600, border: { color: '#FFFFFF', width: 14 } },
    foreground: [],
    text: {
      greeting: { x: 90, y: 790, width: 900, fontSize: 64, align: 'center', font: 'display', color: MODERN.text },
      subline: { x: 140, y: 930, width: 800, fontSize: 28, align: 'center', font: 'body', color: MODERN.subtext },
      from: { x: 140, y: 1260, width: 800, fontSize: 30, align: 'center', font: 'script', color: '#FFFFFF', shadow: true },
    },
  },

  // 10 ── Changa: kites over the valley ────────────────────────────────────
  {
    id: 'changa',
    name: { ne: 'चङ्गा', en: 'Changa' },
    style: 'modern',
    days: ['dashain', 'bijaya-dashami', 'kojagrat-purnima'],
    palette: { ...MODERN, bg: ['#FFE7B8', '#FFF4E0', '#FFFBF4'] },
    background: [
      {
        kind: 'kites',
        colors: ['#B3121F', '#F59E0B', '#4D7C0F', '#C08A2E'],
        positions: [
          { x: 130, y: 120, size: 46, rot: -18 },
          { x: 930, y: 90, size: 58, rot: 14 },
          { x: 820, y: 260, size: 30, rot: -8 },
          { x: 250, y: 300, size: 26, rot: 20 },
        ],
      },
      { kind: 'mountains', y: 1150, colors: ['#E8C9A0', '#C9A57A'], opacity: 0.9 },
    ],
    photo: { shape: 'arch', cx: 540, cy: 530, width: 560, height: 620, border: { color: '#B3121F', width: 8 } },
    foreground: [],
    text: textBlock(890, MODERN.text, MODERN.subtext),
  },

  // 11 ── Pardesh: minimal diaspora card ───────────────────────────────────
  {
    id: 'pardesh',
    name: { ne: 'परदेश', en: 'Pardesh' },
    style: 'modern',
    days: ALL,
    palette: MODERN,
    background: [
      { kind: 'border', inset: 54, color: MODERN.gold, width: 2 },
      { kind: 'mandala', cx: 1080, cy: 0, r: 380, color: MODERN.primary, opacity: 0.08 },
      { kind: 'mandala', cx: 0, cy: 1350, r: 380, color: MODERN.primary, opacity: 0.08 },
    ],
    photo: { shape: 'rounded', cx: 540, cy: 480, width: 600, height: 640, border: { color: MODERN.gold, width: 3 } },
    foreground: [
      { kind: 'tika', x: 540, y: 870, r: 14, color: '#C1121F' },
      { kind: 'jamara', x: 120, y: 1290, width: 90, height: 170, color: '#C3D35A', count: 18 },
    ],
    text: {
      greeting: { x: 110, y: 910, width: 860, fontSize: 58, align: 'center', font: 'display', color: MODERN.text },
      subline: { x: 150, y: 1060, width: 780, fontSize: 28, align: 'center', font: 'body', color: MODERN.subtext },
      from: { x: 150, y: 1210, width: 780, fontSize: 30, align: 'center', font: 'script', color: MODERN.primary },
    },
  },

  // 12 ── Dhaka Heritage: textile-pattern frame ────────────────────────────
  {
    id: 'dhaka-heritage',
    name: { ne: 'ढाका सम्पदा', en: 'Dhaka Heritage' },
    style: 'traditional',
    days: ALL,
    palette: CREAM,
    background: [
      { kind: 'pattern-dhaka', y: 0, height: 90, colors: ['#1F1410', '#A3111C', '#FFF9EE', '#EA8A00'] },
      { kind: 'pattern-dhaka', y: 90, height: 40, colors: ['#A3111C', '#1F1410', '#EA8A00', '#FFF9EE'] },
      { kind: 'pattern-dhaka', y: 1220, height: 40, colors: ['#A3111C', '#1F1410', '#EA8A00', '#FFF9EE'] },
      { kind: 'pattern-dhaka', y: 1260, height: 90, colors: ['#1F1410', '#A3111C', '#FFF9EE', '#EA8A00'] },
      { kind: 'mandala', cx: 540, cy: 560, r: 420, color: CREAM.primary, opacity: 0.08 },
      { kind: 'grain', opacity: 0.05 },
    ],
    photo: { shape: 'arch', cx: 540, cy: 560, width: 520, height: 600, border: { color: '#1F1410', width: 6, double: true } },
    foreground: [
      { kind: 'diyo', x: 190, y: 800, size: 42, color: '#9A3412', flame: '#F59E0B' },
      { kind: 'diyo', x: 890, y: 800, size: 42, color: '#9A3412', flame: '#F59E0B' },
    ],
    text: {
      greeting: { x: 90, y: 905, width: 900, fontSize: 58, align: 'center', font: 'display', color: CREAM.text },
      subline: { x: 140, y: 1050, width: 800, fontSize: 28, align: 'center', font: 'body', color: CREAM.subtext },
      from: { x: 140, y: 1160, width: 800, fontSize: 28, align: 'center', font: 'script', color: CREAM.primary },
    },
  },
];

export function getTemplate(id: string): CardTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES.find((t) => t.id === 'vijaya-poster')!;
}

/** Templates for a day — day-specific designs first, then all-festival ones. */
export function templatesForDay(day: DayId): CardTemplate[] {
  const specific = TEMPLATES.filter((t) => t.days.includes(day));
  const general = TEMPLATES.filter((t) => !t.days.includes(day) && t.days.includes('dashain'));
  return [...specific, ...general];
}
