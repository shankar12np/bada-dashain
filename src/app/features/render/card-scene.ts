/**
 * CardScene — one Konva stage that renders a card from (template + design).
 *
 * The same class powers:
 *  • the interactive editor (drag / pinch / wheel the photo, drag text), and
 *  • exports (PNG/JPEG at any size) via `toBlob()`.
 *
 * The stage is always laid out in *card pixels* (1080 × 1350) and simply
 * scaled down to fit the screen, so what you see is exactly what you export.
 *
 * Layers (bottom → top):
 *   bg     – template background motifs          (static, no hit-testing)
 *   photo  – the user's photo, clipped to frame   (interactive)
 *   fg     – frame border + foreground motifs     (static)
 *   text   – greeting / blessing / sender         (interactive: vertical drag)
 */
import Konva from 'konva';
import type { CardDesign, CardText, PhotoTransform } from '../../models/card.model';
import { CARD_HEIGHT, CARD_WIDTH, type CardTemplate, type PhotoFrame, type TextSlot } from '../../models/template.model';
import { getTemplate } from '../../data/templates';
import { buildLayer, backgroundGradient, ogDecor } from './motifs';
import { environment } from '../../../environments/environment';

// Allow pinch-zoom while a drag is in progress (mobile).
Konva.hitOnDragEnabled = true;

export interface SceneOptions {
  interactive: boolean;
  /** On-screen width in CSS px. Height follows the 4:5 ratio. */
  displayWidth: number;
}

export interface SceneCallbacks {
  onTransform?: (t: PhotoTransform) => void;
  onTextOffset?: (offsetY: number) => void;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;

// ─── fonts ──────────────────────────────────────────────────────────────────
/** Font stacks per role. Fonts are self-hosted via @fontsource (see styles.css). */
function fontFor(role: TextSlot['font'], lang: CardText['lang'], style: CardTemplate['style'], text: string) {
  // Sanskrit verses (॥) get a typeface designed for shlokas.
  if (text.includes('॥') && lang === 'ne' && role === 'body') {
    return { family: '"Tiro Devanagari Sanskrit", "Mukta", serif', weight: 'normal' };
  }
  switch (role) {
    case 'display':
      if (lang === 'ne') {
        // Modern cards use Mukta Bold: clean, and its Devanagari digits (२०८३) read unambiguously.
        return style === 'modern'
          ? { family: '"Mukta", sans-serif', weight: '700' }
          : { family: '"Yatra One", "Mukta", serif', weight: 'normal' };
      }
      return style === 'modern'
        ? { family: '"Mukta", sans-serif', weight: '700' }
        : { family: '"Cormorant Garamond", "Mukta", serif', weight: '700' };
    case 'script':
      return { family: '"Kalam", "Mukta", cursive', weight: 'normal' };
    case 'sanskrit':
      return { family: '"Tiro Devanagari Sanskrit", "Mukta", serif', weight: 'normal' };
    default:
      return { family: '"Mukta", sans-serif', weight: lang === 'ne' ? '500' : 'normal' };
  }
}

/** Wait until every card font is ready — canvas text won't re-render later. */
export async function ensureCardFonts(): Promise<void> {
  if (!('fonts' in document)) return;
  const sample = 'दशैं Dashain';
  await Promise.allSettled([
    document.fonts.load(`40px "Yatra One"`, sample),
    document.fonts.load(`40px "Mukta"`, sample),
    document.fonts.load(`500 40px "Mukta"`, sample),
    document.fonts.load(`700 40px "Mukta"`, sample),
    document.fonts.load(`40px "Kalam"`, sample),
    document.fonts.load(`40px "Tiro Devanagari Sanskrit"`, 'जयन्ती ॥'),
    document.fonts.load(`700 40px "Cormorant Garamond"`, 'Dashain'),
  ]);
}

// ─── frame geometry ─────────────────────────────────────────────────────────
/** Trace the photo frame outline (used for both clipping and the border). */
function tracePath(ctx: CanvasRenderingContext2D | Konva.Context, f: PhotoFrame, grow = 0): void {
  const w = f.width + grow * 2;
  const h = f.height + grow * 2;
  const x = f.cx - w / 2;
  const y = f.cy - h / 2;
  ctx.beginPath();
  switch (f.shape) {
    case 'circle':
      ctx.arc(f.cx, f.cy, Math.min(w, h) / 2, 0, Math.PI * 2);
      break;
    case 'arch': {
      const r = w / 2;
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + r);
      ctx.arc(f.cx, y + r, r, Math.PI, 0);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      break;
    }
    case 'diamond-arch': {
      // Pointed (temple-door) arch.
      const shoulder = y + h * 0.32;
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, shoulder);
      ctx.quadraticCurveTo(x, y + h * 0.08, f.cx, y);
      ctx.quadraticCurveTo(x + w, y + h * 0.08, x + w, shoulder);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      break;
    }
    case 'rounded':
    default: {
      const r = Math.min(48 + grow, w / 4);
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  }
}

// ─── scene ──────────────────────────────────────────────────────────────────
export class CardScene {
  readonly stage: Konva.Stage;
  private readonly bgLayer = new Konva.Layer({ listening: false });
  private readonly photoLayer = new Konva.Layer();
  private readonly fgLayer = new Konva.Layer({ listening: false });
  private readonly textLayer = new Konva.Layer();

  private template!: CardTemplate;
  private design!: CardDesign;
  private photoNode: Konva.Image | null = null;
  private textGroup: Konva.Group | null = null;
  private pinch: { dist: number; scale: number } | null = null;
  private renderToken = 0;

  private constructor(
    container: HTMLDivElement,
    private readonly opts: SceneOptions,
    private readonly cb: SceneCallbacks = {},
  ) {
    this.stage = new Konva.Stage({ container, width: CARD_WIDTH, height: CARD_HEIGHT });
    this.stage.add(this.bgLayer, this.photoLayer, this.fgLayer, this.textLayer);
    this.textLayer.listening(opts.interactive);
    this.photoLayer.listening(opts.interactive);
    this.resize(opts.displayWidth);
    if (opts.interactive) this.bindGestures();
  }

  /** Build a scene. Await this — it loads fonts and any template artwork. */
  static async create(
    container: HTMLDivElement,
    design: CardDesign,
    opts: SceneOptions,
    cb?: SceneCallbacks,
  ): Promise<CardScene> {
    await ensureCardFonts();
    const scene = new CardScene(container, opts, cb);
    await scene.setDesign(design, true);
    return scene;
  }

  /** Fit the stage to a new on-screen width (keeps card coordinates). */
  resize(displayWidth: number): void {
    const k = displayWidth / CARD_WIDTH;
    this.stage.size({ width: displayWidth, height: CARD_HEIGHT * k });
    this.stage.scale({ x: k, y: k });
  }

  /** Apply a new design, rebuilding only what changed. */
  async setDesign(next: CardDesign, force = false): Promise<void> {
    const prev = this.design;
    this.design = next;
    const token = ++this.renderToken;

    if (force || prev.templateId !== next.templateId) {
      this.template = getTemplate(next.templateId);
      await this.buildStatic(token);
      if (token !== this.renderToken) return; // a newer render superseded us
      this.buildPhoto();
      this.buildText();
    } else {
      if (prev.photo !== next.photo) this.buildPhoto();
      else if (prev.transform !== next.transform) this.applyTransform();
      if (prev.text !== next.text) {
        // Only the vertical offset changed (e.g. while dragging the text):
        // move the group instead of rebuilding it, so the drag isn't interrupted.
        if (sameTextExceptOffset(prev.text, next.text) && this.textGroup) {
          this.textGroup.y(next.text.offsetY ?? 0);
        } else {
          this.buildText();
        }
      }
    }
    this.stage.batchDraw();
  }

  /** Export the card. `width` is the output width in px (default 1080). */
  toBlob(width = CARD_WIDTH, mimeType: 'image/png' | 'image/jpeg' = 'image/png', quality = 0.92): Promise<Blob> {
    const pixelRatio = width / this.stage.width();
    return this.stage.toBlob({ pixelRatio, mimeType, quality }) as Promise<Blob>;
  }

  /** Export as a canvas (for composing the Open Graph image). */
  toCanvas(width = CARD_WIDTH): HTMLCanvasElement {
    return this.stage.toCanvas({ pixelRatio: width / this.stage.width() });
  }

  get palette() {
    return this.template.palette;
  }

  destroy(): void {
    this.stage.destroy();
  }

  // ── builders ──────────────────────────────────────────────────────────────

  private async buildStatic(token: number): Promise<void> {
    const t = this.template;
    const [bgNodes, fgNodes] = await Promise.all([
      Promise.all(t.background.map((l) => buildLayer(l, CARD_WIDTH, CARD_HEIGHT).catch(() => null))),
      Promise.all(t.foreground.map((l) => buildLayer(l, CARD_WIDTH, CARD_HEIGHT).catch(() => null))),
    ]);
    if (token !== this.renderToken) return;

    this.bgLayer.destroyChildren();
    this.bgLayer.add(backgroundGradient(CARD_WIDTH, CARD_HEIGHT, t.palette.bg));
    bgNodes.forEach((n) => n && this.bgLayer.add(n as Konva.Shape));
    this.bgLayer.add(this.photoHalo(t.photo, t.palette.gold));

    this.fgLayer.destroyChildren();
    this.fgLayer.add(this.frameBorder(t.photo));
    fgNodes.forEach((n) => n && this.fgLayer.add(n as Konva.Shape));
  }

  private frameBorder(f: PhotoFrame): Konva.Shape {
    return new Konva.Shape({
      listening: false,
      sceneFunc: (ctx) => {
        const c = ctx._context as CanvasRenderingContext2D;
        c.save();
        // Thicker ring with a warm golden glow so the person's photo is the star of the card.
        const w = Math.max(12, f.border.width * 1.4);
        c.strokeStyle = f.border.color;
        c.lineWidth = w;
        c.shadowColor = 'rgba(255, 200, 90, 0.85)';
        c.shadowBlur = 34;
        tracePath(c, f, w / 2);
        c.stroke();
        c.shadowBlur = 0;
        // Thin bright inner rim, like light catching gilded metal.
        c.strokeStyle = 'rgba(255, 245, 210, 0.9)';
        c.lineWidth = 2.5;
        tracePath(c, f, 1);
        c.stroke();
        c.strokeStyle = f.border.color;
        if (f.border.double) {
          c.lineWidth = Math.max(3, w / 3);
          tracePath(c, f, w * 2);
          c.stroke();
        }
        c.restore();
      },
    });
  }

  /** Radial golden light behind the photo frame (sits behind the photo, so only the rim glows). */
  private photoHalo(f: PhotoFrame, gold: string): Konva.Shape {
    return new Konva.Shape({
      listening: false,
      sceneFunc: (ctx) => {
        const c = ctx._context as CanvasRenderingContext2D;
        const r = Math.max(f.width, f.height) / 2;
        const g = c.createRadialGradient(f.cx, f.cy, r * 0.75, f.cx, f.cy, r + 110);
        g.addColorStop(0, hexA(gold, 0.75));
        g.addColorStop(0.55, hexA(gold, 0.28));
        g.addColorStop(1, hexA(gold, 0));
        c.fillStyle = g;
        c.beginPath();
        c.arc(f.cx, f.cy, r + 110, 0, Math.PI * 2);
        c.fill();
      },
    });
  }

  private buildPhoto(): void {
    const f = this.template.photo;
    this.photoLayer.destroyChildren();
    this.photoNode = null;

    const clip = new Konva.Group({ clipFunc: (ctx) => tracePath(ctx, f) });
    this.photoLayer.add(clip);

    // Backdrop inside the frame (visible while panning / for placeholder).
    clip.add(
      new Konva.Rect({
        x: f.cx - f.width / 2,
        y: f.cy - f.height / 2,
        width: f.width,
        height: f.height,
        fill: this.template.palette.cream,
        listening: false,
      }),
    );

    const { photo } = this.design;
    if (!photo) {
      clip.add(this.placeholder(f));
      return;
    }

    const size = this.design.photoSize ?? {
      width: (photo as HTMLCanvasElement).width,
      height: (photo as HTMLCanvasElement).height,
    };
    const node = new Konva.Image({
      image: photo,
      width: size.width,
      height: size.height,
      offsetX: size.width / 2,
      offsetY: size.height / 2,
      draggable: this.opts.interactive,
      name: 'photo',
    });
    if (this.opts.interactive) {
      node.on('mouseenter', () => (this.stage.container().style.cursor = 'grab'));
      node.on('mouseleave', () => (this.stage.container().style.cursor = 'default'));
      node.on('dragmove', () => this.emitTransform());
    }
    clip.add(node);
    this.photoNode = node;
    this.applyTransform();
  }

  /** "Your photo here" placeholder — a silhouette in palette colours. */
  private placeholder(f: PhotoFrame): Konva.Group {
    const p = this.template.palette;
    const g = new Konva.Group({ listening: false });
    g.add(
      new Konva.Circle({ x: f.cx, y: f.cy - f.height * 0.12, radius: f.width * 0.16, fill: p.gold, opacity: 0.35 }),
      new Konva.Ellipse({
        x: f.cx,
        y: f.cy + f.height * 0.32,
        radiusX: f.width * 0.32,
        radiusY: f.height * 0.24,
        fill: p.gold,
        opacity: 0.35,
      }),
    );
    return g;
  }

  /** Cover-fit scale: photo exactly fills the frame at transform.scale = 1. */
  private coverScale(): number {
    const f = this.template.photo;
    const n = this.photoNode!;
    return Math.max(f.width / n.width(), f.height / n.height());
  }

  private applyTransform(): void {
    if (!this.photoNode) return;
    const f = this.template.photo;
    const t = this.design.transform;
    const s = this.coverScale() * t.scale;
    this.photoNode.position({ x: f.cx + t.x, y: f.cy + t.y });
    this.photoNode.scale({ x: s, y: s });
    this.photoNode.rotation(t.rotation);
  }

  private emitTransform(): void {
    if (!this.photoNode) return;
    const f = this.template.photo;
    const t: PhotoTransform = {
      x: Math.round(this.photoNode.x() - f.cx),
      y: Math.round(this.photoNode.y() - f.cy),
      scale: this.photoNode.scaleX() / this.coverScale(),
      rotation: this.photoNode.rotation(),
    };
    this.design = { ...this.design, transform: t };
    this.cb.onTransform?.(t);
  }

  private buildText(): void {
    this.textLayer.destroyChildren();
    const { text } = this.design;
    const slots = this.template.text;
    const style = this.template.style;
    const group = new Konva.Group({
      y: text.offsetY ?? 0,
      draggable: this.opts.interactive,
      dragBoundFunc: (pos) => ({ x: this.stage.x(), y: pos.y }), // vertical only
    });

    const make = (slot: TextSlot, value: string, y: number, maxLines: number) => {
      const font = fontFor(slot.font, text.lang, style, value);
      const color = (slot.font === 'display' && text.color) || slot.color || this.template.palette.text;
      const node = new Konva.Text({
        x: slot.x,
        y,
        width: slot.width,
        text: value,
        fontSize: slot.fontSize,
        fontFamily: font.family,
        fontStyle: font.weight,
        align: slot.align,
        // Devanagari needs room above/below for matras (ि, ु, ँ…).
        lineHeight: text.lang === 'ne' ? 1.45 : 1.2,
        padding: 6,
        wrap: 'word',
        fill: color,
        ...(slot.shadow || style === 'traditional'
          ? { shadowColor: 'rgba(0,0,0,0.45)', shadowBlur: 10, shadowOpacity: 0.6, shadowOffset: { x: 0, y: 2 } }
          : {}),
      });
      // Auto-shrink long text so it never overflows its slot.
      while (node.height() > node.fontSize() * node.lineHeight() * maxLines + 14 && node.fontSize() > 22) {
        node.fontSize(node.fontSize() - 2);
      }
      group.add(node);
      return node;
    };

    const g = make(slots.greeting, text.greeting, slots.greeting.y, 2);
    let bottom = g.y() + g.height();
    if (text.subline) {
      // The blessing always sits right under the greeting, however many lines it took.
      // Shlokas keep their own line breaks, so allow as many lines as the verse has (min 3).
      const s = make(slots.subline, text.subline, bottom + 14, Math.max(3, text.subline.split('\n').length));
      bottom = s.y() + s.height();
    }
    if (text.from) {
      make(slots.from, text.from, Math.max(slots.from.y, bottom + 14), 1);
    }

    if (this.opts.interactive) {
      group.on('mouseenter', () => (this.stage.container().style.cursor = 'ns-resize'));
      group.on('mouseleave', () => (this.stage.container().style.cursor = 'default'));
      group.on('dragmove', () => {
        const y = Math.max(-400, Math.min(400, Math.round(group.y())));
        group.y(y);
        this.design = { ...this.design, text: { ...this.design.text, offsetY: y } };
        this.cb.onTextOffset?.(y);
      });
    }
    this.textLayer.add(group);
    this.textGroup = group;
    this.textLayer.add(this.credit(text.lang));
  }

  /**
   * Small "make your own" badge at the bottom of every card, so people who see a
   * shared card (WhatsApp status, Facebook…) know where to make theirs.
   */
  private credit(lang: CardText['lang']): Konva.Label {
    const site = environment.siteUrl.replace(/^https?:\/\//, '');
    const label = new Konva.Label({ listening: false, opacity: 0.92 });
    label.add(
      new Konva.Tag({ fill: 'rgba(30,12,8,0.62)', cornerRadius: 17 }),
      new Konva.Text({
        text: `   ${lang === 'ne' ? 'तपाईं पनि बनाउनुहोस्' : 'Make your own'}  ·  ${site}   `,
        fontFamily: '"Mukta", sans-serif',
        fontStyle: '500',
        fontSize: 21,
        fill: '#FBF3E4',
        padding: 8,
      }),
    );
    label.position({ x: (CARD_WIDTH - label.width()) / 2, y: CARD_HEIGHT - label.height() - 8 });
    return label;
  }

  // ── gestures: wheel zoom (desktop) + pinch zoom (touch) ──────────────────

  private bindGestures(): void {
    this.stage.on('wheel', (e) => {
      if (!this.photoNode || !this.pointerInFrame()) return;
      e.evt.preventDefault();
      this.zoomBy(e.evt.deltaY > 0 ? 0.95 : 1.05);
    });

    this.stage.on('touchmove', (e) => {
      const touches = e.evt.touches;
      if (!this.photoNode || touches.length !== 2) return;
      e.evt.preventDefault();
      if (this.photoNode.isDragging()) this.photoNode.stopDrag();
      const dist = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
      if (!this.pinch) {
        this.pinch = { dist, scale: this.design.transform.scale };
        return;
      }
      this.setScale(this.pinch.scale * (dist / this.pinch.dist));
    });
    this.stage.on('touchend', () => (this.pinch = null));
  }

  private pointerInFrame(): boolean {
    const p = this.stage.getRelativePointerPosition();
    const f = this.template.photo;
    return !!p && Math.abs(p.x - f.cx) <= f.width / 2 && Math.abs(p.y - f.cy) <= f.height / 2;
  }

  private zoomBy(factor: number): void {
    this.setScale(this.design.transform.scale * factor);
  }

  private setScale(scale: number): void {
    const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
    this.design = { ...this.design, transform: { ...this.design.transform, scale: clamped } };
    this.applyTransform();
    this.photoLayer.batchDraw();
    this.emitTransform();
  }
}

/** #rrggbb → rgba() with the given alpha. */
function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function sameTextExceptOffset(a: CardText, b: CardText): boolean {
  return (
    a.greeting === b.greeting &&
    a.subline === b.subline &&
    a.from === b.from &&
    a.color === b.color &&
    a.lang === b.lang
  );
}

// ─── offscreen rendering helpers ───────────────────────────────────────────

/** Render a design without any visible UI (e.g. for remix previews). */
export async function renderOffscreen(design: CardDesign): Promise<CardScene> {
  const div = document.createElement('div');
  return CardScene.create(div, design, { interactive: false, displayWidth: CARD_WIDTH });
}

/**
 * 1200 × 630 Open Graph image: the card centred on a festive backdrop.
 * This is what WhatsApp / Facebook / X show when a link is shared.
 */
export async function composeOgImage(scene: CardScene): Promise<Blob> {
  const W = 1200;
  const H = 630;
  const div = document.createElement('div');
  const stage = new Konva.Stage({ container: div, width: W, height: H });
  const layer = new Konva.Layer({ listening: false });
  stage.add(layer);
  ogDecor(W, H, scene.palette).forEach((n) => layer.add(n as Konva.Shape));

  const cardH = H - 96;
  const cardW = cardH * (CARD_WIDTH / CARD_HEIGHT);
  layer.add(
    new Konva.Image({
      image: scene.toCanvas(Math.round(cardW * 2)),
      x: (W - cardW) / 2,
      y: 48,
      width: cardW,
      height: cardH,
      shadowColor: 'black',
      shadowBlur: 30,
      shadowOpacity: 0.45,
      cornerRadius: 10,
    }),
  );
  layer.draw();
  const blob = (await stage.toBlob({ pixelRatio: 1, mimeType: 'image/jpeg', quality: 0.85 })) as Blob;
  stage.destroy();
  return blob;
}
