import { Injectable, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { ToastService } from '../../core/ui/toast.service';
import type { Card } from '../../models/card.model';
import { CardRenderService } from '../render/card-render.service';

/**
 * Sharing helpers. Prefers the native share sheet (best on phones — it lists
 * WhatsApp, Viber, Messenger, TikTok… whatever the user actually has), with
 * explicit deep links as fallbacks for desktop.
 */
@Injectable({ providedIn: 'root' })
export class ShareService {
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly render = inject(CardRenderService);

  url(card: Card): string {
    return `${location.origin}/c/${card.id}`;
  }

  private message(card: Card): string {
    return `${card.text.greeting}\n${this.i18n.t('viewer.shareText')}`;
  }

  get canNativeShare(): boolean {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }

  /** Native share of the link (the receiver sees the OG preview). */
  async shareLink(card: Card): Promise<void> {
    const url = this.url(card);
    if (this.canNativeShare) {
      try {
        await navigator.share({ title: 'Tika · टीका', text: this.message(card), url });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
      }
    }
    await this.copy(url);
  }

  /**
   * Share the image file itself (WhatsApp status, Instagram story…).
   * Requires Storage CORS (see cors.json) because we fetch the image.
   */
  async shareImage(card: Card): Promise<void> {
    try {
      const blob = await this.fetchImage(card);
      const file = new File([blob], `tika-${card.dayId}.jpg`, { type: 'image/jpeg' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${this.message(card)}\n${this.url(card)}` });
      } else {
        await this.render.saveImage(blob, file.name);
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') this.toast.error(this.i18n.t('error.generic'));
    }
  }

  async download(card: Card): Promise<void> {
    try {
      await this.render.saveImage(await this.fetchImage(card), `tika-${card.dayId}.jpg`);
    } catch {
      window.open(card.imageUrl, '_blank', 'noopener');
    }
  }

  whatsappUrl(card: Card): string {
    return `https://wa.me/?text=${encodeURIComponent(`${this.message(card)}\n${this.url(card)}`)}`;
  }

  facebookUrl(card: Card): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.url(card))}`;
  }

  viberUrl(card: Card): string {
    return `viber://forward?text=${encodeURIComponent(`${this.message(card)}\n${this.url(card)}`)}`;
  }

  async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.toast.success(this.i18n.t('viewer.copied'));
    } catch {
      prompt('', text);
    }
  }

  private async fetchImage(card: Card): Promise<Blob> {
    const res = await fetch(card.imageUrl, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.blob();
  }
}
