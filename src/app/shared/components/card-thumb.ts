import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { getDay } from '../../data/festival-days';
import type { Card } from '../../models/card.model';

/** Gallery tile: lazy-loaded 432px thumbnail with day label. */
@Component({
  selector: 'app-card-thumb',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a [routerLink]="['/c', card().id]" class="group block overflow-hidden rounded-xl bg-cream shadow-card">
      <div class="aspect-[4/5] overflow-hidden">
        <img [src]="card().thumbUrl" [alt]="card().text.greeting" loading="lazy" decoding="async"
             width="432" height="540" class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
      </div>
      <div class="flex items-center justify-between gap-2 px-3 py-2 text-xs text-ink-soft">
        <span class="truncate">{{ dayName() }}</span>
        @if (card().remixCount > 0) {
          <span class="shrink-0 rounded-full bg-gold-soft px-2 py-0.5 text-maroon">↻ {{ i18n.num(card().remixCount) }}</span>
        }
      </div>
    </a>
  `,
})
export class CardThumb {
  readonly card = input.required<Card>();
  protected readonly i18n = inject(I18nService);
  protected readonly dayName = computed(() => this.i18n.pick(getDay(this.card().dayId).name));
}
