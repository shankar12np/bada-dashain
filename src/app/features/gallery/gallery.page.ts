import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { FESTIVAL_DAYS } from '../../data/festival-days';
import type { Card } from '../../models/card.model';
import { isDayId, type DayId } from '../../models/festival.model';
import { CardThumb } from '../../shared/components/card-thumb';
import { CardRepository } from '../cards/card.repository';

/** `/gallery` and `/gallery/:dayId` — public cards, newest first, filterable by day. */
@Component({
  selector: 'app-gallery-page',
  imports: [RouterLink, CardThumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-12 md:pt-10">
      <h1 class="heading mb-5 text-3xl text-sindoor">{{ i18n.t('gallery.title') }}</h1>

      <nav class="scroll-x mb-6" aria-label="Filter by day">
        <a routerLink="/gallery" class="chip" [class.chip-active]="!day()">{{ i18n.t('gallery.all') }}</a>
        @for (d of days; track d.id) {
          <a [routerLink]="['/gallery', d.id]" class="chip" [class.chip-active]="day() === d.id">{{ i18n.pick(d.name) }}</a>
        }
      </nav>

      @if (error()) {
        <div class="py-16 text-center">
          <p class="text-ink-soft">{{ i18n.t('error.generic') }}</p>
          <button type="button" class="btn-ghost mt-4" (click)="reload()">{{ i18n.t('common.retry') }}</button>
        </div>
      } @else if (!loading() && !cards().length) {
        <div class="py-16 text-center">
          <p class="text-ink-soft">{{ i18n.t('gallery.empty') }}</p>
          <a [routerLink]="['/create', day() ?? 'bijaya-dashami']" class="btn-primary mt-6">{{ i18n.t('home.cta') }}</a>
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          @for (c of cards(); track c.id) {
            <app-card-thumb [card]="c" />
          }
          @if (loading()) {
            @for (i of skeletons; track i) {
              <div class="skeleton aspect-[4/5]"></div>
            }
          }
        </div>
        @if (cursor() && !loading()) {
          <div class="mt-8 text-center">
            <button type="button" class="btn-ghost" (click)="more()">{{ i18n.t('gallery.more') }}</button>
          </div>
        }
      }
    </section>
  `,
})
export class GalleryPage {
  readonly dayId = input<string>();

  protected readonly i18n = inject(I18nService);
  private readonly repo = inject(CardRepository);
  private readonly seo = inject(SeoService);

  protected readonly days = FESTIVAL_DAYS.filter((d) => d.id !== 'dashain');
  protected readonly skeletons = [1, 2, 3, 4, 5, 6, 7, 8];
  protected readonly day = computed<DayId | null>(() => {
    const d = this.dayId();
    return isDayId(d) ? d : null;
  });
  protected readonly cards = signal<Card[]>([]);
  protected readonly cursor = signal<QueryDocumentSnapshot | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);

  constructor() {
    effect(() => {
      const day = this.day();
      untracked(() => {
        this.seo.set({ title: this.i18n.t('gallery.title'), description: this.i18n.t('home.lead'), path: day ? `/gallery/${day}` : '/gallery' });
        this.reload();
      });
    });
  }

  protected reload(): void {
    this.cards.set([]);
    this.cursor.set(null);
    void this.fetch();
  }

  protected more(): void {
    void this.fetch();
  }

  private async fetch(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    const day = this.day();
    try {
      const page = await this.repo.listPublic(day, this.cursor());
      if (day !== this.day()) return; // filter changed while loading
      this.cards.update((list) => [...list, ...page.cards]);
      this.cursor.set(page.cursor);
    } catch (e) {
      console.error('[gallery]', e);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
