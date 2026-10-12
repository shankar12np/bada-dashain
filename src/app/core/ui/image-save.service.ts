import { Injectable, signal } from '@angular/core';

/**
 * Saves images the way each device expects.
 * Kept separate from the card renderer so the app shell doesn't pull in Konva.
 *
 *  • iPhone/iPad: Safari puts downloads in the Files app, not Photos. We open the
 *    share sheet instead (it has "Save Image"); if that isn't allowed, the image is
 *    shown full-screen (<app-save-preview>) so the user can press-and-hold →
 *    "Save to Photos".
 *  • Everything else: a normal file download.
 */
@Injectable({ providedIn: 'root' })
export class ImageSaveService {
  /** Object URL of an image waiting to be saved by hand on iPhone/iPad. */
  readonly preview = signal<string | null>(null);

  async save(blob: Blob, filename: string): Promise<void> {
    if (isAppleTouchDevice()) {
      const file = new File([blob], filename, { type: blob.type || 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          return;
        } catch (e) {
          if ((e as Error).name === 'AbortError') return; // user closed the sheet
          // NotAllowedError (gesture expired) etc. → manual preview below
        }
      }
      this.closePreview();
      this.preview.set(URL.createObjectURL(blob));
      return;
    }
    download(blob, filename);
  }

  closePreview(): void {
    const url = this.preview();
    if (url) URL.revokeObjectURL(url);
    this.preview.set(null);
  }
}

/** Plain file download (desktop, Android → Downloads / Gallery). */
export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** iPhone, iPod, or iPad (iPadOS reports itself as a Mac, so also check for touch). */
function isAppleTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}
