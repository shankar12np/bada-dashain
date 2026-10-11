import type { Bilingual, DayId } from './festival.model';

/**
 * Templates are *declarative data* interpreted by the renderer.
 *
 * Why data and not image files?
 *  • Crisp at any resolution (card, thumbnail, OG image) from one definition.
 *  • Zero Storage/bandwidth cost; ships in the JS bundle (~1 KB each).
 *  • Adding a template = adding an object. No designer tools needed.
 *  • An `image` layer type lets you drop in licensed artwork later
 *    (e.g. a commissioned Durga illustration) without changing the renderer.
 *
 * All coordinates are in card pixels on the base 1080 × 1350 (4:5) canvas.
 */
export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

export type TemplateStyle = 'traditional' | 'modern';

export interface Palette {
  /** Background gradient stops, top → bottom. */
  bg: string[];
  primary: string; // deep red family
  gold: string;
  accent: string; // saffron / marigold
  green: string; // jamara
  cream: string;
  text: string; // default greeting colour
  subtext: string;
}

export type PhotoShape = 'circle' | 'arch' | 'rounded' | 'diamond-arch';

export interface PhotoFrame {
  shape: PhotoShape;
  /** Centre of the frame. */
  cx: number;
  cy: number;
  width: number;
  height: number;
  /** Decorative ring/border around the photo. */
  border: { color: string; width: number; double?: boolean };
}

export interface TextSlot {
  x: number;
  y: number;
  width: number;
  fontSize: number;
  align: 'left' | 'center' | 'right';
  /** Font role; renderer maps it to an actual font per language. */
  font: 'display' | 'body' | 'script' | 'sanskrit';
  color?: string;
  /** Soft shadow behind the text for legibility over busy backgrounds. */
  shadow?: boolean;
}

/** Decorative layers. Each `kind` maps to a draw function in `motifs.ts`. */
export type Layer =
  | { kind: 'pattern-dhaka'; y: number; height: number; colors: string[]; opacity?: number }
  | { kind: 'mandala'; cx: number; cy: number; r: number; color: string; opacity?: number; petals?: number }
  | { kind: 'border'; inset: number; color: string; width: number; double?: boolean; corners?: boolean }
  | { kind: 'toran'; y: number; colors: string[] }
  | { kind: 'garland'; y: number; sag: number; color: string; leaf: string }
  | { kind: 'marigold'; x: number; y: number; r: number; color: string; center?: string }
  | { kind: 'diyo'; x: number; y: number; size: number; color: string; flame: string }
  | { kind: 'kalash'; x: number; y: number; size: number; color: string; accent: string; leaf: string }
  | { kind: 'jamara'; x: number; y: number; width: number; height: number; color: string; count?: number }
  | { kind: 'tika'; x: number; y: number; r: number; color: string }
  | { kind: 'mountains'; y: number; colors: string[]; opacity?: number }
  | { kind: 'kites'; colors: string[]; positions: { x: number; y: number; size: number; rot: number }[] }
  | { kind: 'sun-rays'; cx: number; cy: number; r: number; color: string; opacity?: number; count?: number }
  | { kind: 'trishul'; x: number; y: number; size: number; color: string }
  | { kind: 'lotus'; x: number; y: number; size: number; color: string; accent: string }
  | { kind: 'moon'; x: number; y: number; r: number; color: string; glow: string }
  | { kind: 'image'; src: string; x: number; y: number; width: number; height: number; opacity?: number }
  | { kind: 'grain'; opacity: number };

export interface CardTemplate {
  id: string;
  name: Bilingual;
  style: TemplateStyle;
  /** Days this template is suggested for. `dashain` = suitable for every day. */
  days: DayId[];
  palette: Palette;
  /** Layers drawn BEHIND the photo. */
  background: Layer[];
  photo: PhotoFrame;
  /** Layers drawn ON TOP of the photo (garlands overlapping the frame, etc.). */
  foreground: Layer[];
  text: {
    greeting: TextSlot;
    subline: TextSlot;
    from: TextSlot;
  };
}
