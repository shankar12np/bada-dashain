import { Injectable } from '@angular/core';
import type { CardDesign } from '../../models/card.model';
import { CARD_WIDTH } from '../../models/template.model';
import { CardScene, composeOgImage, type SceneCallbacks, type SceneOptions } from './card-scene';

export interface LoadedPhoto {
  /** Downscaled, orientation-corrected bitmap ready for the canvas. */
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export interface CardExports {
  /** Full card, 1080 × 1350 JPEG (~200–400 KB). */
  card: Blob;
  /** Gallery thumbnail, 432 × 540 JPEG (~30 KB). */
  thumb: Blob;
  /** Social preview, 1200 × 630 JPEG. */
  og: Blob;
}

const MAX_PHOTO_BYTES = 25 * 1024 * 1024;
/** Longest edge kept from the user's photo. 2× the largest frame — sharp but light. */
const MAX_PHOTO_EDGE = 2048;

/**
 * Card generation — 100% client-side.
 *
 * Generating images in the browser means no image-processing servers,
 * no Cloud Function CPU time and no egress for originals: the only thing
 * uploaded is the finished card (+ thumbnail + social preview).
 */
@Injectable({ providedIn: 'root' })
export class CardRenderService {
  /** Decode, auto-rotate (EXIF) and downscale a user photo. */
  async loadPhoto(file: File): Promise<LoadedPhoto> {
    if (file.size > MAX_PHOTO_BYTES) throw new Error('photo-too-big');
    if (file.type && !file.type.startsWith('image/')) throw new Error('photo-invalid');

    let bitmap: ImageBitmap | HTMLImageElement;
    try {
      // createImageBitmap honours EXIF orientation ('from-image' is the default).
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // Fallback for older Safari: decode via <img>.
      bitmap = await this.decodeWithImg(file);
    }

    const w = 'naturalWidth' in bitmap ? bitmap.naturalWidth : bitmap.width;
    const h = 'naturalHeight' in bitmap ? bitmap.naturalHeight : bitmap.height;
    const k = Math.min(1, MAX_PHOTO_EDGE / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * k);
    canvas.height = Math.round(h * k);
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    if ('close' in bitmap) bitmap.close();
    return { canvas, width: canvas.width, height: canvas.height };
  }

  /** Create an on-screen (or offscreen) scene for a design. */
  createScene(
    container: HTMLDivElement,
    design: CardDesign,
    opts: SceneOptions,
    cb?: SceneCallbacks,
  ): Promise<CardScene> {
    return CardScene.create(container, design, opts, cb);
  }

  /** Produce every image we upload when a card is saved. */
  async exportAll(scene: CardScene): Promise<CardExports> {
    const [card, thumb, og] = await Promise.all([
      scene.toBlob(CARD_WIDTH, 'image/jpeg', 0.9),
      scene.toBlob(432, 'image/jpeg', 0.8),
      composeOgImage(scene),
    ]);
    return { card, thumb, og };
  }

  /** Download a lossless PNG of the card — works fully offline, no account needed. */
  async downloadPng(scene: CardScene, filename = 'dashain-card.png'): Promise<void> {
    const blob = await scene.toBlob(CARD_WIDTH, 'image/png');
    this.saveBlob(blob, filename);
  }

  saveBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  private decodeWithImg(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('photo-invalid'));
      };
      img.src = url;
    });
  }
}
