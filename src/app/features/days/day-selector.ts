import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { DASHAIN_DATES, FESTIVAL_DAYS, currentFestivalDay } from '../../data/festival-days';
import type { DayId, FestivalDay } from '../../models/festival.model';
import { DayIcon } from '../../shared/components/day-icon';

/**
 * Grid of festival days. Each tile links to the editor for that day.
 * Shows both scripts at once — the active language large, the other small —
 * so a grandparent and a grandchild can both read it.
 */
@Component({
  selector: 'app-day-selector',
  imports: [RouterLink, DayIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      @for (day of days; track day.id) {
        <li>
          <a [routerLink]="['/create', day.id]"
             class="group relative flex h-full gap-3 rounded-2xl border bg-paper p-4 shadow-card transition hover:-translate-y-0.5 hover:border-sindoor"
             [class.border-gold]="day.id !== today"
             [class.border-sindoor]="day.id === today"
             [class.ring-2]="day.id === today"
             [class.ring-sindoor]="day.id === today">
            @if (day.id === today) {
              <span class="absolute -top-2.5 right-4 rounded-full bg-sindoor px-2.5 py-0.5 text-xs text-cream">
                {{ i18n.t('home.today') }}
              </span>
            }
            <span class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-cream ring-1 ring-gold/50">
              <app-day-icon [motif]="day.motif" [size]="40" />
            </span>
            <span class="min-w-0">
              <span class="heading block text-xl leading-tight" [style.color]="day.accent">{{ i18n.pick(day.name) }}</span>
              <span class="block text-xs text-ink-soft">
                {{ other(day) }}
                @if (dateOf(day.id); as d) { · {{ d }} }
              </span>
              @if (!compact()) {
                <span class="mt-1.5 line-clamp-3 block text-sm text-ink-soft">{{ i18n.pick(day.description) }}</span>
              }
            </span>
          </a>
        </li>
      }
    </ul>
  `,
})
export class DaySelector {
  readonly compact = input(false);
  protected readonly i18n = inject(I18nService);
  protected readonly days = FESTIVAL_DAYS;
  protected readonly today = currentFestivalDay();

  protected other(day: FestivalDay): string {
    return this.i18n.lang() === 'ne' ? day.name.en : day.name.ne;
  }

  protected dateOf(id: DayId): string | null {
    const iso = DASHAIN_DATES[new Date().getFullYear()]?.[id];
    if (!iso) return null;
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString(this.i18n.lang() === 'ne' ? 'ne-NP' : 'en-US', { month: 'short', day: 'numeric' });
  }
}
