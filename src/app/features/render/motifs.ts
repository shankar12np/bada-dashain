/**
 * Motif library — procedural drawings of traditional Nepali/Hindu festive
 * symbols, painted directly with the Canvas 2D API inside Konva shapes.
 *
 * Why procedural?
 *  • Resolution-independent: identical at 360px thumbnails and 1080px exports.
 *  • No image licensing questions, no extra downloads.
 *  • Deterministic: a seeded RNG means the same card always looks the same.
 *
 * Every function returns a non-interactive Konva node (listening: false), so
 * decorative layers cost nothing for hit-testing in the editor.
 */
import Konva from 'konva';
import type { Layer, Palette } from '../../models/template.model';

type Ctx = CanvasRenderingContext2D;

// ─── helpers ────────────────────────────────────────────────────────────────

/** Small, fast, seeded PRNG (mulberry32) so decorations are reproducible. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Wrap native canvas drawing in a decorative Konva shape. */
function paint(draw: (c: Ctx) => void, opacity = 1): Konva.Shape {
  return new Konva.Shape({
    listening: false,
    perfectDrawEnabled: false,
    sceneFunc: (ctx) => {
      const c = ctx._context as Ctx;
      c.save();
      c.globalAlpha *= opacity;
      draw(c);
      c.restore();
    },
  });
}

function petalPath(c: Ctx, len: number, width: number): void {
  // A petal pointing up (−y) from the origin.
  c.beginPath();
  c.moveTo(0, 0);
  c.bezierCurveTo(width, -len * 0.3, width * 0.6, -len * 0.85, 0, -len);
  c.bezierCurveTo(-width * 0.6, -len * 0.85, -width, -len * 0.3, 0, 0);
  c.closePath();
}

function shade(hex: string, amt: number): string {
  // Lighten (amt > 0) or darken (amt < 0) a #rrggbb colour.
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const f = (ch: number) => clamp(amt >= 0 ? ch + (255 - ch) * amt : ch * (1 + amt));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// ─── backgrounds ────────────────────────────────────────────────────────────

export function backgroundGradient(w: number, h: number, stops: string[]): Konva.Rect {
  const colorStops: (number | string)[] = [];
  stops.forEach((c, i) => colorStops.push(stops.length === 1 ? 0 : i / (stops.length - 1), c));
  return new Konva.Rect({
    x: 0,
    y: 0,
    width: w,
    height: h,
    listening: false,
    fillLinearGradientStartPoint: { x: 0, y: 0 },
    fillLinearGradientEndPoint: { x: w * 0.25, y: h },
    fillLinearGradientColorStops: colorStops,
  });
}

/** Dhaka-textile inspired band: nested diamonds and triangles. */
function dhaka(w: number, y: number, h: number, colors: string[], opacity = 1): Konva.Shape {
  const [c0, c1, c2, c3] = [colors[0], colors[1] ?? colors[0], colors[2] ?? colors[0], colors[3] ?? colors[1]];
  return paint((c) => {
    c.save();
    c.beginPath();
    c.rect(0, y, w, h);
    c.clip();
    c.fillStyle = c0;
    c.fillRect(0, y, w, h);
    const t = h; // tile size
    for (let x = -t / 2, i = 0; x < w + t; x += t, i++) {
      const cx = x + t / 2;
      const cy = y + h / 2;
      // outer diamond
      c.fillStyle = c1;
      c.beginPath();
      c.moveTo(cx, y + 2);
      c.lineTo(cx + t / 2 - 2, cy);
      c.lineTo(cx, y + h - 2);
      c.lineTo(cx - t / 2 + 2, cy);
      c.closePath();
      c.fill();
      // inner diamond
      c.fillStyle = i % 2 ? c2 : c3;
      const s = t * 0.27;
      c.beginPath();
      c.moveTo(cx, cy - s);
      c.lineTo(cx + s, cy);
      c.lineTo(cx, cy + s);
      c.lineTo(cx - s, cy);
      c.closePath();
      c.fill();
      // centre dot
      c.fillStyle = c0;
      c.fillRect(cx - t * 0.05, cy - t * 0.05, t * 0.1, t * 0.1);
      // edge triangles between diamonds
      c.fillStyle = c2;
      c.beginPath();
      c.moveTo(x + t, y);
      c.lineTo(x + t + t * 0.14, y + h * 0.22);
      c.lineTo(x + t - t * 0.14, y + h * 0.22);
      c.closePath();
      c.moveTo(x + t, y + h);
      c.lineTo(x + t + t * 0.14, y + h * 0.78);
      c.lineTo(x + t - t * 0.14, y + h * 0.78);
      c.closePath();
      c.fill();
    }
    // thin rules on both edges
    c.fillStyle = c2;
    c.fillRect(0, y, w, 3);
    c.fillRect(0, y + h - 3, w, 3);
    c.restore();
  }, opacity);
}

function mandala(cx: number, cy: number, r: number, color: string, opacity = 0.25, petals = 16): Konva.Shape {
  return paint((c) => {
    c.translate(cx, cy);
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = Math.max(1.5, r * 0.006);
    const rings = [
      { at: r * 0.98, len: r * 0.22, w: r * 0.07, n: petals * 2 },
      { at: r * 0.72, len: r * 0.24, w: r * 0.09, n: petals },
      { at: r * 0.46, len: r * 0.2, w: r * 0.1, n: Math.round(petals / 2) },
    ];
    for (const ring of rings) {
      for (let i = 0; i < ring.n; i++) {
        c.save();
        c.rotate((i / ring.n) * Math.PI * 2);
        c.translate(0, -(ring.at - ring.len));
        petalPath(c, ring.len, ring.w);
        c.stroke();
        c.restore();
      }
      c.beginPath();
      c.arc(0, 0, ring.at - ring.len, 0, Math.PI * 2);
      c.stroke();
    }
    // dotted outer ring
    for (let i = 0; i < petals * 4; i++) {
      const a = (i / (petals * 4)) * Math.PI * 2;
      c.beginPath();
      c.arc(Math.cos(a) * r * 1.04, Math.sin(a) * r * 1.04, r * 0.008 + 1, 0, Math.PI * 2);
      c.fill();
    }
    c.beginPath();
    c.arc(0, 0, r * 0.12, 0, Math.PI * 2);
    c.stroke();
  }, opacity);
}

function sunRays(cx: number, cy: number, r: number, color: string, opacity = 0.18, count = 36): Konva.Shape {
  return paint((c) => {
    c.translate(cx, cy);
    c.fillStyle = color;
    const half = Math.PI / count / 2;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      c.beginPath();
      c.moveTo(0, 0);
      c.arc(0, 0, r, a - half, a + half);
      c.closePath();
      c.fill();
    }
  }, opacity);
}

function border(
  w: number,
  h: number,
  inset: number,
  color: string,
  width: number,
  double = false,
  corners = false,
): Konva.Shape {
  return paint((c) => {
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = width;
    c.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
    if (double) {
      c.lineWidth = Math.max(1.5, width / 3);
      const i2 = inset + width * 3;
      c.strokeRect(i2, i2, w - i2 * 2, h - i2 * 2);
    }
    if (corners) {
      // Lotus-bud corner ornaments.
      const pts: [number, number, number][] = [
        [inset, inset, 0],
        [w - inset, inset, Math.PI / 2],
        [w - inset, h - inset, Math.PI],
        [inset, h - inset, -Math.PI / 2],
      ];
      for (const [x, y, rot] of pts) {
        c.save();
        c.translate(x, y);
        c.rotate(rot);
        c.lineWidth = Math.max(2, width * 0.8);
        c.beginPath();
        c.arc(0, 0, 46, 0, Math.PI / 2);
        c.stroke();
        c.beginPath();
        c.arc(0, 0, 30, 0, Math.PI / 2);
        c.stroke();
        c.save();
        c.rotate(-Math.PI / 4); // point along the inward diagonal
        c.translate(0, 62);
        c.rotate(Math.PI);
        petalPath(c, 26, 12);
        c.fill();
        c.restore();
        c.beginPath();
        c.arc(0, 0, 9, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }
  });
}

// ─── festive motifs ─────────────────────────────────────────────────────────

function drawMarigold(c: Ctx, x: number, y: number, r: number, color: string, center: string, seed: number): void {
  const rand = rng(seed);
  const dark = shade(color, -0.22);
  const light = shade(color, 0.18);
  // three ruffled layers of petals, outside in
  const layers = [
    { rad: r * 0.78, size: r * 0.34, n: 16, col: dark },
    { rad: r * 0.52, size: r * 0.3, n: 13, col: color },
    { rad: r * 0.27, size: r * 0.26, n: 9, col: light },
  ];
  for (const L of layers) {
    for (let i = 0; i < L.n; i++) {
      const a = (i / L.n) * Math.PI * 2 + rand() * 0.4;
      const px = x + Math.cos(a) * L.rad * (0.9 + rand() * 0.15);
      const py = y + Math.sin(a) * L.rad * (0.9 + rand() * 0.15);
      c.fillStyle = L.col;
      c.beginPath();
      c.arc(px, py, L.size * (0.85 + rand() * 0.3), 0, Math.PI * 2);
      c.fill();
    }
  }
  c.fillStyle = center;
  c.beginPath();
  c.arc(x, y, r * 0.16, 0, Math.PI * 2);
  c.fill();
}

function marigold(x: number, y: number, r: number, color: string, center = '#9A3412'): Konva.Shape {
  return paint((c) => drawMarigold(c, x, y, r, color, center, Math.round(x * 31 + y)));
}

/** Marigold garland hanging in a curve across the card (sayapatri/godavari mala). */
function garland(w: number, y: number, sag: number, color: string, leaf: string): Konva.Shape {
  return paint((c) => {
    const n = 26;
    const alt = shade(color, 0.25);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = -20 + t * (w + 40);
      const yy = y + 4 * sag * t * (1 - t);
      if (i % 3 === 1) {
        // mango-leaf accent
        c.save();
        c.translate(x, yy + 18);
        c.rotate(Math.PI);
        c.fillStyle = leaf;
        petalPath(c, 46, 14);
        c.fill();
        c.restore();
      }
      drawMarigold(c, x, yy, 24, i % 2 ? color : alt, '#7C2D12', i * 97 + 3);
    }
  });
}

/** Toran — string of mango leaves and marigolds hung over the doorway. */
function toran(w: number, y: number, colors: string[]): Konva.Shape {
  const [leafCol, flowerCol, cordCol] = [colors[0], colors[1] ?? '#F59E0B', colors[2] ?? '#7C2D12'];
  return paint((c) => {
    c.strokeStyle = cordCol;
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(w, y);
    c.stroke();
    const step = 60;
    for (let x = step / 2, i = 0; x < w; x += step, i++) {
      if (i % 2 === 0) {
        c.save();
        c.translate(x, y);
        c.rotate(Math.PI);
        c.fillStyle = leafCol;
        petalPath(c, 78, 20);
        c.fill();
        c.strokeStyle = shade(leafCol, 0.35);
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(0, -70);
        c.stroke();
        c.restore();
      } else {
        c.strokeStyle = cordCol;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x, y + 30);
        c.stroke();
        drawMarigold(c, x, y + 46, 20, flowerCol, '#7C2D12', i * 13);
      }
    }
  });
}

/** Clay diyo (oil lamp) with a soft glowing flame. */
function diyo(x: number, y: number, size: number, color: string, flame: string): Konva.Shape {
  return paint((c) => {
    c.translate(x, y);
    const s = size;
    // glow
    const g = c.createRadialGradient(0, -s * 0.55, 0, 0, -s * 0.55, s * 1.3);
    g.addColorStop(0, 'rgba(255,200,80,0.55)');
    g.addColorStop(1, 'rgba(255,170,40,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, -s * 0.55, s * 1.3, 0, Math.PI * 2);
    c.fill();
    // bowl
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(-s, 0);
    c.quadraticCurveTo(0, s * 0.95, s, 0);
    c.quadraticCurveTo(s * 0.55, -s * 0.12, s * 0.15, -s * 0.05);
    c.lineTo(s * 0.35, -s * 0.2); // spout
    c.lineTo(-s * 0.05, -s * 0.08);
    c.quadraticCurveTo(-s * 0.6, -s * 0.15, -s, 0);
    c.closePath();
    c.fill();
    // rim highlight + dots
    c.strokeStyle = shade(color, 0.35);
    c.lineWidth = Math.max(1.5, s * 0.05);
    c.beginPath();
    c.moveTo(-s * 0.85, s * 0.12);
    c.quadraticCurveTo(0, s * 0.6, s * 0.85, s * 0.12);
    c.stroke();
    // flame
    const fx = s * 0.3;
    const fy = -s * 0.22;
    const fg = c.createLinearGradient(fx, fy, fx, fy - s * 0.85);
    fg.addColorStop(0, '#FFF7D6');
    fg.addColorStop(0.45, flame);
    fg.addColorStop(1, shade(flame, -0.25));
    c.fillStyle = fg;
    c.beginPath();
    c.moveTo(fx, fy);
    c.bezierCurveTo(fx + s * 0.28, fy - s * 0.25, fx + s * 0.08, fy - s * 0.6, fx, fy - s * 0.85);
    c.bezierCurveTo(fx - s * 0.08, fy - s * 0.6, fx - s * 0.28, fy - s * 0.25, fx, fy);
    c.fill();
  });
}

/** Kalash — sacred water vessel with mango leaves, used at Ghatasthapana. */
function kalash(x: number, y: number, size: number, color: string, accent: string, leaf: string): Konva.Shape {
  return paint((c) => {
    c.translate(x, y);
    const s = size;
    // mango leaves fanning out
    c.fillStyle = leaf;
    for (let i = -3; i <= 3; i++) {
      c.save();
      c.translate(0, -s * 0.95);
      c.rotate(i * 0.32);
      petalPath(c, s * 0.75, s * 0.13);
      c.fill();
      c.strokeStyle = shade(leaf, 0.3);
      c.lineWidth = Math.max(1, s * 0.012);
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, -s * 0.68);
      c.stroke();
      c.restore();
    }
    // coconut / shriphal
    c.fillStyle = '#8B5A2B';
    c.beginPath();
    c.ellipse(0, -s * 1.12, s * 0.26, s * 0.3, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = accent;
    c.fillRect(-s * 0.26, -s * 1.08, s * 0.52, s * 0.07);
    // body
    const body = c.createLinearGradient(-s * 0.6, 0, s * 0.6, 0);
    body.addColorStop(0, shade(color, -0.25));
    body.addColorStop(0.45, shade(color, 0.25));
    body.addColorStop(1, shade(color, -0.3));
    c.fillStyle = body;
    c.beginPath();
    c.moveTo(-s * 0.32, -s * 0.85); // rim left
    c.lineTo(s * 0.32, -s * 0.85);
    c.quadraticCurveTo(s * 0.2, -s * 0.72, s * 0.24, -s * 0.62); // neck
    c.bezierCurveTo(s * 0.85, -s * 0.45, s * 0.75, s * 0.05, s * 0.35, s * 0.15);
    c.lineTo(s * 0.4, s * 0.3); // foot
    c.lineTo(-s * 0.4, s * 0.3);
    c.lineTo(-s * 0.35, s * 0.15);
    c.bezierCurveTo(-s * 0.75, s * 0.05, -s * 0.85, -s * 0.45, -s * 0.24, -s * 0.62);
    c.quadraticCurveTo(-s * 0.2, -s * 0.72, -s * 0.32, -s * 0.85);
    c.closePath();
    c.fill();
    // decorative bands + sacred thread
    c.strokeStyle = accent;
    c.lineWidth = Math.max(2, s * 0.035);
    c.beginPath();
    c.ellipse(0, -s * 0.38, s * 0.5, s * 0.06, 0, 0, Math.PI);
    c.stroke();
    c.beginPath();
    c.ellipse(0, -s * 0.05, s * 0.52, s * 0.06, 0, 0, Math.PI);
    c.stroke();
    // tika dot on the kalash
    c.fillStyle = '#C1121F';
    c.beginPath();
    c.arc(0, -s * 0.22, s * 0.07, 0, Math.PI * 2);
    c.fill();
  });
}

/**
 * Jamara — barley shoots grown in darkness during Navaratri,
 * hence their characteristic pale yellow-green.
 */
function jamara(x: number, y: number, width: number, height: number, color: string, count = 34): Konva.Shape {
  return paint((c) => {
    const rand = rng(Math.round(x * 7 + y * 13 + width));
    const tip = shade(color, 0.35);
    for (let i = 0; i < count; i++) {
      const bx = x + (rand() - 0.5) * width * 0.35;
      const lean = (rand() - 0.5) * width * 1.1;
      const h = height * (0.65 + rand() * 0.35);
      const g = c.createLinearGradient(bx, y, bx + lean, y - h);
      g.addColorStop(0, shade(color, -0.25));
      g.addColorStop(1, tip);
      c.strokeStyle = g;
      c.lineWidth = 3 + rand() * 3;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(bx, y);
      c.quadraticCurveTo(bx + lean * 0.2, y - h * 0.6, bx + lean, y - h);
      c.stroke();
    }
    // red sacred thread tying the bundle
    c.strokeStyle = '#C1121F';
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(x - width * 0.14, y - height * 0.12);
    c.lineTo(x + width * 0.14, y - height * 0.16);
    c.stroke();
  });
}

/** Tika — vermilion, rice and yoghurt. Rendered with rice-grain texture. */
function tika(x: number, y: number, r: number, color: string): Konva.Shape {
  return paint((c) => {
    const rand = rng(Math.round(x + y * 3 + r));
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, shade(color, 0.2));
    g.addColorStop(1, shade(color, -0.2));
    c.fillStyle = g;
    c.beginPath();
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const rr = r * (0.92 + rand() * 0.12);
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    c.fill();
    // rice grains (akshata)
    c.fillStyle = 'rgba(255,240,230,0.7)';
    for (let i = 0; i < Math.round(r / 2.5); i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * r * 0.8;
      c.save();
      c.translate(x + Math.cos(a) * d, y + Math.sin(a) * d);
      c.rotate(rand() * Math.PI);
      c.beginPath();
      c.ellipse(0, 0, r * 0.07, r * 0.03, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
  });
}

/** Layered Himalayan silhouette. */
function mountains(w: number, y: number, colors: string[], opacity = 1): Konva.Shape {
  return paint((c) => {
    colors.forEach((col, layer) => {
      const rand = rng(101 + layer * 17);
      const base = y + layer * 60;
      c.fillStyle = col;
      c.beginPath();
      c.moveTo(0, 2000);
      let x = -40;
      c.lineTo(x, base + 60);
      while (x < w + 40) {
        const peakW = 90 + rand() * 160;
        const peakH = 70 + rand() * (160 - layer * 30);
        c.lineTo(x + peakW / 2, base - peakH + 60);
        x += peakW;
        c.lineTo(x, base + 40 + rand() * 40);
      }
      c.lineTo(w + 40, 2000);
      c.closePath();
      c.fill();
      // snow caps on the back layer
      if (layer === 0) {
        c.fillStyle = 'rgba(255,255,255,0.35)';
        c.fill();
      }
    });
  }, opacity);
}

/** Changa — the kites that fill Nepal's skies during Dashain. */
function kites(colors: string[], positions: { x: number; y: number; size: number; rot: number }[]): Konva.Shape {
  return paint((c) => {
    positions.forEach((p, i) => {
      const col = colors[i % colors.length];
      const s = p.size;
      c.save();
      c.translate(p.x, p.y);
      c.rotate((p.rot * Math.PI) / 180);
      // string
      c.strokeStyle = 'rgba(60,30,20,0.35)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(0, s);
      c.bezierCurveTo(s * 0.6, s * 2.2, -s * 0.6, s * 3.2, s * 0.3, s * 4.5);
      c.stroke();
      // body (diamond)
      c.fillStyle = col;
      c.beginPath();
      c.moveTo(0, -s);
      c.lineTo(s * 0.8, 0);
      c.lineTo(0, s);
      c.lineTo(-s * 0.8, 0);
      c.closePath();
      c.fill();
      // half colour panel + spars
      c.fillStyle = shade(col, 0.4);
      c.beginPath();
      c.moveTo(0, -s);
      c.lineTo(s * 0.8, 0);
      c.lineTo(0, 0);
      c.closePath();
      c.fill();
      c.strokeStyle = 'rgba(60,30,20,0.5)';
      c.beginPath();
      c.moveTo(0, -s);
      c.lineTo(0, s);
      c.moveTo(-s * 0.8, 0);
      c.quadraticCurveTo(0, -s * 0.35, s * 0.8, 0);
      c.stroke();
      // tail
      c.fillStyle = shade(col, -0.15);
      c.beginPath();
      c.moveTo(0, s * 0.9);
      c.lineTo(s * 0.22, s * 1.25);
      c.lineTo(-s * 0.22, s * 1.25);
      c.closePath();
      c.fill();
      c.restore();
    });
  });
}

/** Trishul — Goddess Durga's trident; a respectful symbol of Shakti. */
function trishul(x: number, y: number, size: number, color: string): Konva.Shape {
  return paint((c) => {
    c.translate(x, y);
    const s = size / 200; // drawn on a 120×200 grid, origin at bottom-centre
    c.scale(s, s);
    c.fillStyle = color;
    c.strokeStyle = color;
    // shaft
    c.fillRect(-5, -150, 10, 150);
    // damaru-like knot
    c.beginPath();
    c.ellipse(0, -112, 13, 6, 0, 0, Math.PI * 2);
    c.fill();
    // centre prong
    c.beginPath();
    c.moveTo(0, -200);
    c.quadraticCurveTo(12, -175, 6, -150);
    c.lineTo(-6, -150);
    c.quadraticCurveTo(-12, -175, 0, -200);
    c.fill();
    // side prongs
    c.lineWidth = 9;
    c.lineCap = 'round';
    for (const dir of [-1, 1]) {
      c.beginPath();
      c.moveTo(0, -140);
      c.bezierCurveTo(dir * 50, -140, dir * 58, -165, dir * 42, -190);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(-50, -140);
    c.lineTo(50, -140);
    c.stroke();
  });
}

function lotus(x: number, y: number, size: number, color: string, accent: string): Konva.Shape {
  return paint((c) => {
    c.translate(x, y);
    const s = size;
    const back = shade(color, -0.15);
    const angles = [-1.15, -0.75, -0.38, 0, 0.38, 0.75, 1.15];
    angles.forEach((a, i) => {
      c.save();
      c.rotate(a);
      c.fillStyle = i % 2 ? color : back;
      petalPath(c, s * (i === 3 ? 1 : 0.85 - Math.abs(a) * 0.12), s * 0.26);
      c.fill();
      c.strokeStyle = accent;
      c.lineWidth = Math.max(1.5, s * 0.02);
      c.stroke();
      c.restore();
    });
    c.fillStyle = accent;
    c.beginPath();
    c.ellipse(0, s * 0.04, s * 0.7, s * 0.09, 0, 0, Math.PI * 2);
    c.fill();
  });
}

function moon(x: number, y: number, r: number, color: string, glow: string): Konva.Shape {
  return paint((c) => {
    const g = c.createRadialGradient(x, y, r * 0.8, x, y, r * 2.6);
    g.addColorStop(0, glow);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, r * 2.6, 0, Math.PI * 2);
    c.fill();
    const m = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    m.addColorStop(0, shade(color, 0.3));
    m.addColorStop(1, color);
    c.fillStyle = m;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  });
}

/** Subtle paper/grain texture so flat colours feel printed, not digital. */
function grain(w: number, h: number, opacity: number): Konva.Shape {
  let pattern: HTMLCanvasElement | null = null;
  return paint((c) => {
    if (!pattern) {
      pattern = document.createElement('canvas');
      pattern.width = pattern.height = 160;
      const pc = pattern.getContext('2d')!;
      const rand = rng(7);
      const img = pc.createImageData(160, 160);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = rand() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      pc.putImageData(img, 0, 0);
    }
    c.globalCompositeOperation = 'overlay';
    c.fillStyle = c.createPattern(pattern, 'repeat')!;
    c.fillRect(0, 0, w, h);
  }, opacity);
}

/** Artwork is loaded once per session and shared by every render (editor, previews, exports). */
const artCache = new Map<string, Promise<HTMLImageElement>>();

function loadArt(src: string): Promise<HTMLImageElement> {
  let p = artCache.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => {
        artCache.delete(src); // allow a retry later
        reject(new Error(`Could not load template art: ${src}`));
      };
      img.src = src;
    });
    artCache.set(src, p);
  }
  return p;
}

/**
 * Artwork layer (e.g. a devotional painting). Drawn as a framed panel:
 * the art is never cropped, covered or recoloured — it keeps pride of place.
 */
async function imageLayer(l: Extract<Layer, { kind: 'image' }>): Promise<Konva.Group> {
  const img = await loadArt(l.src);
  if (l.fit === 'contain') {
    // Fit inside the box, keep proportions, centre it.
    const k = Math.min(l.width / img.naturalWidth, l.height / img.naturalHeight);
    const w = Math.round(img.naturalWidth * k);
    const h = Math.round(img.naturalHeight * k);
    l = { ...l, x: l.x + (l.width - w) / 2, y: l.y + (l.height - h) / 2, width: w, height: h };
  }
  const g = new Konva.Group({ listening: false, opacity: l.opacity ?? 1 });
  if (l.frame) {
    const fw = l.frame.width;
    // Shadow + outer gold band.
    g.add(
      new Konva.Rect({
        x: l.x - fw,
        y: l.y - fw,
        width: l.width + fw * 2,
        height: l.height + fw * 2,
        fill: l.frame.color,
        shadowColor: 'black',
        shadowBlur: 28,
        shadowOpacity: 0.45,
        shadowOffset: { x: 0, y: 8 },
      }),
    );
  }
  g.add(new Konva.Image({ image: img, x: l.x, y: l.y, width: l.width, height: l.height }));
  if (l.frame) {
    // Fine inner and outer rules give the frame a carved, gilded look.
    const fw = l.frame.width;
    const dark = shade(l.frame.color, -0.35);
    g.add(
      new Konva.Rect({ x: l.x - 1, y: l.y - 1, width: l.width + 2, height: l.height + 2, stroke: dark, strokeWidth: 2 }),
      new Konva.Rect({ x: l.x - fw + 3, y: l.y - fw + 3, width: l.width + fw * 2 - 6, height: l.height + fw * 2 - 6, stroke: dark, strokeWidth: 1.5 }),
    );
  }
  return g;
}

// ─── poster effects (drawn over full-bleed photos) ─────────────────────────

function fade(w: number, y0: number, y1: number, stops: [number, string][]): Konva.Shape {
  return paint((c) => {
    const g = c.createLinearGradient(0, y0, 0, y1);
    for (const [at, col] of stops) g.addColorStop(at, col);
    c.fillStyle = g;
    c.fillRect(0, Math.min(y0, y1), w, Math.abs(y1 - y0));
  });
}

function vignette(w: number, h: number, strength: number, color = '0,0,0'): Konva.Shape {
  return paint((c) => {
    const g = c.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.35, w / 2, h * 0.45, Math.hypot(w, h) * 0.62);
    g.addColorStop(0, `rgba(${color},0)`);
    g.addColorStop(1, `rgba(${color},${strength})`);
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
}

function lightLeak(x: number, y: number, r: number, color: string, opacity: number): Konva.Shape {
  return paint((c) => {
    c.globalCompositeOperation = 'screen';
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }, opacity);
}

function bokeh(
  w: number,
  h: number,
  count: number,
  colors: string[],
  area = { x: 0, y: 0, w, h },
  seed = 11,
): Konva.Shape {
  return paint((c) => {
    const rand = rng(seed);
    c.globalCompositeOperation = 'screen';
    for (let i = 0; i < count; i++) {
      const x = area.x + rand() * area.w;
      const y = area.y + rand() * area.h;
      const col = colors[i % colors.length];
      if (i % 3 === 0) {
        // four-point sparkle
        const s = 6 + rand() * 12;
        c.save();
        c.translate(x, y);
        c.fillStyle = col;
        c.globalAlpha = 0.85;
        c.beginPath();
        c.moveTo(0, -s);
        c.quadraticCurveTo(0, 0, s, 0);
        c.quadraticCurveTo(0, 0, 0, s);
        c.quadraticCurveTo(0, 0, -s, 0);
        c.quadraticCurveTo(0, 0, 0, -s);
        c.fill();
        c.restore();
      } else {
        // soft out-of-focus light orb
        const r = 8 + rand() * 30;
        const g = c.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, col);
        g.addColorStop(0.6, col.replace(/[\d.]+\)$/, '0.25)'));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fill();
      }
    }
  });
}

/** Build a Konva node for one declarative layer. */
export async function buildLayer(l: Layer, w: number, h: number): Promise<Konva.Node> {
  switch (l.kind) {
    case 'pattern-dhaka':
      return dhaka(w, l.y, l.height, l.colors, l.opacity);
    case 'mandala':
      return mandala(l.cx, l.cy, l.r, l.color, l.opacity, l.petals);
    case 'border':
      return border(w, h, l.inset, l.color, l.width, l.double, l.corners);
    case 'toran':
      return toran(w, l.y, l.colors);
    case 'garland':
      return garland(w, l.y, l.sag, l.color, l.leaf);
    case 'marigold':
      return marigold(l.x, l.y, l.r, l.color, l.center);
    case 'diyo':
      return diyo(l.x, l.y, l.size, l.color, l.flame);
    case 'kalash':
      return kalash(l.x, l.y, l.size, l.color, l.accent, l.leaf);
    case 'jamara':
      return jamara(l.x, l.y, l.width, l.height, l.color, l.count);
    case 'tika':
      return tika(l.x, l.y, l.r, l.color);
    case 'mountains':
      return mountains(w, l.y, l.colors, l.opacity);
    case 'kites':
      return kites(l.colors, l.positions);
    case 'sun-rays':
      return sunRays(l.cx, l.cy, l.r, l.color, l.opacity, l.count);
    case 'trishul':
      return trishul(l.x, l.y, l.size, l.color);
    case 'lotus':
      return lotus(l.x, l.y, l.size, l.color, l.accent);
    case 'moon':
      return moon(l.x, l.y, l.r, l.color, l.glow);
    case 'image':
      return imageLayer(l);
    case 'grain':
      return grain(w, h, l.opacity);
    case 'fade':
      return fade(w, l.y0, l.y1, l.stops);
    case 'vignette':
      return vignette(w, h, l.strength, l.color);
    case 'light-leak':
      return lightLeak(l.x, l.y, l.r, l.color, l.opacity);
    case 'bokeh':
      return bokeh(w, h, l.count, l.colors, l.area, l.seed);
  }
}

/** Utility for palette-derived decorations used in the OG composition. */
export function ogDecor(w: number, h: number, p: Palette): Konva.Node[] {
  return [
    backgroundGradient(w, h, p.bg),
    mandala(140, h / 2, 260, p.gold, 0.18),
    mandala(w - 140, h / 2, 260, p.gold, 0.18),
    dhaka(w, 0, 34, [p.primary, p.gold, p.cream, p.accent], 0.9),
    dhaka(w, h - 34, 34, [p.primary, p.gold, p.cream, p.accent], 0.9),
  ];
}
