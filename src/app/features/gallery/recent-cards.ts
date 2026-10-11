import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import type { Card } from '../../models/card.model';
import { CardThumb } from '../../shared/components/card-thumb';
import { CardRepository } from '../cards/card.repository';

/** Horizontal strip of the newest public cards (home page). */
@Component({
  selector: 'app-recent-cards',
  imports: [CardThumb],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cards().length) {
      <div class="scroll-x">
        @for (c of cards(); track c.id) {
          <app-card-thumb [card]="c" class="w-40 shrink-0 sm:w-48" />
        }
      </div>
    } @else if (loading()) {
      <div class="scroll-x">
        @for (i of [1, 2, 3, 4, 5]; track i) {
          <div class="skeleton aspect-[4/5] w-40 shrink-0 sm:w-48"></div>
        }
      </div>
    } @else {
      <p class="text-ink-soft">{{ i18n.t('gallery.empty') }}</p>
    }
  `,
})
export class RecentCards implements OnInit {
  private readonly repo = inject(CardRepository);
  protected readonly i18n = inject(I18nService);
  protected readonly cards = signal<Card[]>([]);
  protected readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const page = await this.repo.listPublic(null);
      this.cards.set(page.cards.slice(0, 12));
    } catch (e) {
      console.warn('[recent] could not load', e);
    } finally {
      this.loading.set(false);
    }
  }
}
