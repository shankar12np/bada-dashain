import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { ImageSaveService } from '../../core/ui/image-save.service';

/**
 * iPhone fallback for saving a card: the card full-screen with a
 * "press and hold → Save to Photos" hint (iOS lets no website write into Photos directly).
 */
@Component({
  selector: 'app-save-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (saver.preview(); as url) {
      <div class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-ink/95 p-4"
           role="dialog" aria-modal="true" (click)="saver.closePreview()">
        <img [src]="url" alt="" class="max-h-[75dvh] w-auto max-w-full rounded-xl shadow-card" (click)="$event.stopPropagation()" />
        <p class="max-w-sm text-center text-lg text-cream">{{ i18n.t('save.hint') }}</p>
        <button type="button" class="btn-gold" (click)="saver.closePreview()">{{ i18n.t('common.close') }}</button>
      </div>
    }
  `,
})
export class SavePreview {
  protected readonly saver = inject(ImageSaveService);
  protected readonly i18n = inject(I18nService);
}
