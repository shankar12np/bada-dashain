import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { fillGreeting, greetingsForDay } from '../../data/greetings';
import { templatesForDay } from '../../data/templates';
import { DEFAULT_TRANSFORM } from '../../models/card.model';
import type { DayId, Lang } from '../../models/festival.model';
import type { CardTemplate } from '../../models/template.model';
import { renderOffscreen } from '../render/card-scene';

/** Rendered previews are cached per template+day+lang for the whole session. */
const previewCache = new Map<string, string>();

/**
 * Horizontal strip of template previews, rendered live from the template
 * definitions (so they always match the real output exactly).
 */
@Component({
  selector: 'app-template-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scroll-x md:grid md:grid-cols-3 md:overflow-visible xl:grid-cols-4" role="radiogroup" [attr.aria-label]="i18n.t('editor.tab.design')">
      @for (t of templates(); track t.id) {
        <button type="button" role="radio" [attr.aria-checked]="t.id === selected()" (click)="pick.emit(t.id)"
                class="w-28 shrink-0 overflow-hidden rounded-xl border-2 bg-cream text-left transition sm:w-32 md:w-auto"
                [class.border-sindoor]="t.id === selected()" [class.border-transparent]="t.id !== selected()">
          @if (previews()[t.id]; as src) {
            <img [src]="src" alt="" class="aspect-[4/5] w-full" />
          } @else {
            <div class="skeleton aspect-[4/5] w-full rounded-none"></div>
          }
          <span class="block truncate px-2 py-1.5 text-xs">
            {{ i18n.pick(t.name) }}
            <span class="text-ink-soft">· {{ t.style === 'modern' ? (i18n.lang() === 'ne' ? 'आधुनिक' : 'Modern') : (i18n.lang() === 'ne' ? 'परम्परागत' : 'Classic') }}</span>
          </span>
        </button>
      }
    </div>
  `,
})
export class TemplatePicker {
  readonly day = input.required<DayId>();
  readonly lang = input.required<Lang>();
  readonly selected = input.required<string>();
  readonly pick = output<string>();

  protected readonly i18n = inject(I18nService);
  protected readonly templates = signal<CardTemplate[]>([]);
  protected readonly previews = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const day = this.day();
      const lang = this.lang();
      untracked(() => {
        this.templates.set(templatesForDay(day));
        void this.renderPreviews(day, lang);
      });
    });
  }

  /** Render one at a time so the main thread stays responsive. */
  private async renderPreviews(day: DayId, lang: Lang): Promise<void> {
    const g = greetingsForDay(day)[0];
    for (const t of this.templates()) {
      const key = `${t.id}|${day}|${lang}`;
      let src = previewCache.get(key);
      if (!src) {
        const scene = await renderOffscreen({
          templateId: t.id,
          dayId: day,
          photo: null,
          transform: DEFAULT_TRANSFORM,
          text: { greeting: fillGreeting(g.greeting[lang], lang), subline: null, from: null, lang },
        });
        src = scene.stage.toDataURL({ pixelRatio: 256 / scene.stage.width(), mimeType: 'image/jpeg', quality: 0.8 });
        scene.destroy();
        previewCache.set(key, src);
        await new Promise((r) => setTimeout(r)); // yield to the browser between renders
      }
      this.previews.update((p) => ({ ...p, [t.id]: src! }));
    }
  }
}
