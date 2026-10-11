import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { FestivalDay } from '../../models/festival.model';

/** Small inline-SVG emblem for each festival day (no icon font, no requests). */
@Component({
  selector: 'app-day-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 48 48" [attr.width]="size()" [attr.height]="size()" fill="none">
      @switch (motif()) {
        @case ('kalash') {
          <path d="M24 9c-6 0-9 2-9 2s5 3 9 3 9-3 9-3-3-2-9-2Z" fill="#4D7C0F" />
          <path d="M17 14h14l-2 4c7 3 7 15-5 17-12-2-12-14-5-17l-2-4Z" fill="#D9A93F" />
          <circle cx="24" cy="8" r="4" fill="#8B5A2B" /><circle cx="24" cy="24" r="1.8" fill="#B3121F" />
          <path d="M19 37h10l1 3H18l1-3Z" fill="#A87A22" />
        }
        @case ('jamara') {
          <g stroke="#B5C94A" stroke-width="2.2" stroke-linecap="round">
            <path d="M24 40C23 30 18 20 12 8" /><path d="M24 40c0-11 0-22 1-34" /><path d="M24 40c2-10 7-21 13-31" />
            <path d="M24 40c-2-8-6-15-12-22" /><path d="M24 40c2-8 6-15 12-21" />
          </g>
          <path d="M19 35l10-1" stroke="#B3121F" stroke-width="3" stroke-linecap="round" />
        }
        @case ('diyo') {
          <path d="M28 25c3-4 1-9-2-13-1 4-4 7-3 11 0 1 2 3 5 2Z" fill="#F59E0B" />
          <path d="M8 28c8 12 24 12 32 0-6-1-12 1-16 1S14 27 8 28Z" fill="#B45309" />
        }
        @case ('marigold') {
          <g fill="#F59E0B">
            @for (a of petals; track a) {
              <circle [attr.cx]="24 + 12 * cos(a)" [attr.cy]="24 + 12 * sin(a)" r="6" />
            }
          </g>
          <circle cx="24" cy="24" r="8" fill="#EA8A00" /><circle cx="24" cy="24" r="3.5" fill="#9A3412" />
        }
        @case ('trishul') {
          <g fill="#B3121F"><rect x="22.5" y="16" width="3" height="28" rx="1.5" /><path d="M24 3l3 8-3 6-3-6 3-8Z" /></g>
          <path d="M12 7c0 8 5 11 12 11s12-3 12-11" stroke="#B3121F" stroke-width="3" stroke-linecap="round" />
        }
        @case ('lotus') {
          <path d="M24 10c5 5 6 13 0 22-6-9-5-17 0-22Z" fill="#F9A8B4" />
          <path d="M24 32C17 31 11 26 9 18c7 1 12 6 15 14Zm0 0c7-1 13-6 15-14-7 1-12 6-15 14Z" fill="#E879A0" />
          <path d="M10 35h28" stroke="#D9A93F" stroke-width="3" stroke-linecap="round" />
        }
        @case ('moon') {
          <circle cx="24" cy="24" r="17" fill="#F3D99A" opacity=".35" /><circle cx="24" cy="24" r="12" fill="#EBC46A" />
        }
        @default {
          <circle cx="24" cy="24" r="12" fill="#B3121F" />
          <g fill="#FBF3E4" opacity=".85">
            <ellipse cx="20" cy="21" rx="2" ry="1" /><ellipse cx="27" cy="23" rx="2" ry="1" transform="rotate(40 27 23)" />
            <ellipse cx="23" cy="28" rx="2" ry="1" transform="rotate(-30 23 28)" />
          </g>
        }
      }
    </svg>
  `,
})
export class DayIcon {
  readonly motif = input.required<FestivalDay['motif']>();
  readonly size = input(40);
  protected readonly petals = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);
  protected readonly cos = Math.cos;
  protected readonly sin = Math.sin;
}
