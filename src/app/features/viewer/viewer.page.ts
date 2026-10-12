import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { getDay } from '../../data/festival-days';
import type { Card } from '../../models/card.model';
import { DayIcon } from '../../shared/components/day-icon';
import { CardRepository } from '../cards/card.repository';
import { ReportDialog } from './report-dialog';
import { ShareService } from './share.service';

/**
 * `/c/:id` — a shared card. This is the page recipients land on, so the
 * single most important action is "Make it mine" (the viral loop).
 */
@Component({
  selector: 'app-viewer-page',
  imports: [RouterLink, DayIcon, ReportDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12 md:pt-10">
      @if (loading()) {
        <div class="grid gap-8 md:grid-cols-[minmax(300px,440px)_minmax(0,1fr)]">
          <div class="skeleton aspect-[4/5] w-full"></div>
          <div class="space-y-3"><div class="skeleton h-10 w-3/4"></div><div class="skeleton h-24"></div></div>
        </div>
      } @else if (card(); as c) {
        @if (isNew()) {
          <div class="mb-6 flex flex-col gap-3 rounded-2xl bg-jamara p-4 text-cream sm:flex-row sm:items-center">
            <div class="sm:flex-1">
              <p class="heading text-2xl">{{ i18n.t('viewer.ready') }}</p>
              <p class="text-sm text-cream/90">{{ i18n.t('viewer.readyHint') }}</p>
            </div>
            <button type="button" class="btn-gold text-lg" (click)="shareNow(c)">↗ {{ i18n.t('viewer.shareLink') }}</button>
          </div>
        }

        <div class="grid gap-8 md:grid-cols-[minmax(300px,440px)_minmax(0,1fr)] md:items-start">
          <figure class="overflow-hidden rounded-2xl bg-cream shadow-card">
            <img [src]="c.imageUrl" [alt]="c.text.greeting" width="1080" height="1350" class="aspect-[4/5] w-full" fetchpriority="high" />
          </figure>

          <div>
            <a [routerLink]="['/gallery', c.dayId]" class="mb-3 inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-sm">
              <app-day-icon [motif]="day()!.motif" [size]="22" /> {{ i18n.pick(day()!.name) }}
            </a>
            <h1 class="heading text-3xl leading-snug text-sindoor md:text-4xl" [lang]="c.text.lang">{{ c.text.greeting }}</h1>
            @if (c.text.subline) {
              <p class="mt-3 whitespace-pre-line text-lg text-ink-soft" [lang]="c.text.lang">{{ c.text.subline }}</p>
            }
            @if (c.text.from || c.ownerName) {
              <p class="mt-3 font-script text-xl text-ink">— {{ c.text.from || c.ownerName }}</p>
            }

            <!-- The viral loop -->
            <a [routerLink]="['/create', c.dayId]" [queryParams]="{ remix: c.id }"
               class="btn-gold mt-8 w-full text-lg sm:w-auto">✨ {{ i18n.t('viewer.makeMine') }}</a>
            <p class="mt-2 text-sm text-ink-soft">{{ i18n.t('viewer.makeMineHint') }}</p>
            @if (c.remixCount > 0) {
              <p class="mt-1 text-sm text-ink-soft">↻ {{ i18n.num(c.remixCount) }} {{ i18n.t('viewer.remixes') }}</p>
            }

            <!-- Share: always the clickable link, never a dead-end image -->
            <div class="mt-8 border-t border-gold/30 pt-6">
              <h2 class="label">{{ i18n.t('viewer.share') }}</h2>
              <p class="mb-3 text-xs text-ink-soft">{{ i18n.t('viewer.shareHint') }}</p>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="btn-primary" (click)="shareNow(c)">↗ {{ i18n.t('viewer.shareLink') }}</button>
                <a class="btn-ghost" [href]="share.whatsappUrl(c)" target="_blank" rel="noopener">WhatsApp</a>
                <a class="btn-ghost" [href]="share.facebookUrl(c)" target="_blank" rel="noopener">Facebook</a>
                <a class="btn-ghost" [href]="share.messengerUrl(c)" target="_blank" rel="noopener">Messenger</a>
                <a class="btn-ghost" [href]="share.viberUrl(c)">Viber</a>
                <a class="btn-ghost" [href]="share.telegramUrl(c)" target="_blank" rel="noopener">Telegram</a>
                <a class="btn-ghost" [href]="share.xUrl(c)" target="_blank" rel="noopener">X</a>
                <button type="button" class="btn-ghost" (click)="share.copy(share.url(c))">🔗 {{ i18n.t('viewer.copy') }}</button>
                <button type="button" class="btn-ghost" (click)="share.download(c)">⬇ {{ i18n.t('editor.download') }}</button>
              </div>
            </div>

            <div class="mt-8">
              <app-report-dialog [cardId]="c.id" />
            </div>
          </div>
        </div>
      } @else {
        <div class="py-24 text-center">
          <p class="heading text-2xl text-sindoor">{{ i18n.t('viewer.notFound') }}</p>
          <a routerLink="/create" class="btn-primary mt-6">{{ i18n.t('home.cta') }}</a>
        </div>
      }
    </section>
  `,
})
export class ViewerPage {
  readonly id = input.required<string>();
  readonly new = input<string>();

  protected readonly i18n = inject(I18nService);
  protected readonly share = inject(ShareService);
  private readonly repo = inject(CardRepository);
  private readonly seo = inject(SeoService);

  protected readonly card = signal<Card | null>(null);
  protected readonly loading = signal(true);
  protected readonly isNew = computed(() => this.new() === '1');
  protected readonly day = computed(() => {
    const c = this.card();
    return c ? getDay(c.dayId) : null;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.load(id));
    });
  }

  /** Native share sheet (lists every app on the phone); copies the link elsewhere. */
  protected shareNow(card: Card): void {
    void this.share.shareLink(card);
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const card = await this.repo.get(id);
      this.card.set(card);
      if (card) {
        this.seo.set({
          title: card.text.greeting,
          description: card.text.subline ?? this.i18n.t('viewer.makeMineHint'),
          image: card.ogUrl ?? card.imageUrl,
          path: `/c/${card.id}`,
        });
      }
    } catch (e) {
      console.error('[viewer] load failed', e);
      this.card.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
