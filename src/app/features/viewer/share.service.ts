import { Injectable, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { ToastService } from '../../core/ui/toast.service';
import { ImageSaveService } from '../../core/ui/image-save.service';
import type { Card } from '../../models/card.model';

/**
 * Sharing helpers — always the clickable card link. Prefers the native share sheet (best on phones — it lists
 * WhatsApp, Viber, Messenger, TikTok… whatever the user actually has), with
 * explicit deep links as fallbacks for desktop.
 */
@Injectable({ providedIn: 'root' })
export class ShareService {
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly saver = inject(ImageSaveService);

  url(card: Card): string {
    return `${location.origin}/c/${card.id}`;
  }

  private message(card: Card): string {
    return `${card.text.greeting}\n${this.i18n.t('viewer.shareText')}`;
  }

  /** "Make your own" line with the home page link, appended to shared messages. */
  private invite(): string {
    return `${this.i18n.t('share.makeYours')} 👉 ${location.origin}`;
  }

  get canNativeShare(): boolean {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }

  /** Native share of the link (the receiver sees the OG preview). */
  async shareLink(card: Card): Promise<void> {
    const url = this.url(card);
    if (this.canNativeShare) {
      try {
        await navigator.share({ title: 'Bada Dashain · बडा दशैं', text: `${this.message(card)}\n\n${this.invite()}\n`, url });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
      }
    }
    await this.copy(url);
  }

  /** Save the card image (Photos on iPhone, Downloads elsewhere). Needs Storage CORS. */
  async download(card: Card): Promise<void> {
    try {
      const res = await fetch(card.imageUrl, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await this.saver.save(await res.blob(), `bada-dashain-${card.dayId}.jpg`);
    } catch {
      window.open(card.imageUrl, '_blank', 'noopener');
    }
  }

  whatsappUrl(card: Card): string {
    return `https://wa.me/?text=${encodeURIComponent(`${this.message(card)}\n${this.url(card)}\n\n${this.invite()}`)}`;
  }

  facebookUrl(card: Card): string {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.url(card))}`;
  }

  /** Messenger: the mobile app deep link; on desktop Facebook's dialog handles it. */
  messengerUrl(card: Card): string {
    const link = encodeURIComponent(this.url(card));
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      ? `fb-messenger://share/?link=${link}`
      : `https://www.facebook.com/sharer/sharer.php?u=${link}`;
  }

  telegramUrl(card: Card): string {
    return `https://t.me/share/url?url=${encodeURIComponent(this.url(card))}&text=${encodeURIComponent(`${this.message(card)}\n\n${this.invite()}`)}`;
  }

  xUrl(card: Card): string {
    return `https://x.com/intent/post?url=${encodeURIComponent(this.url(card))}&text=${encodeURIComponent(card.text.greeting)}`;
  }

  viberUrl(card: Card): string {
    return `viber://forward?text=${encodeURIComponent(`${this.message(card)}\n${this.url(card)}\n\n${this.invite()}`)}`;
  }

  async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.toast.success(this.i18n.t('viewer.copied'));
    } catch {
      prompt('', text);
    }
  }
}
