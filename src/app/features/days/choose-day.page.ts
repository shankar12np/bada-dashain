import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { DaySelector } from './day-selector';

/** `/create` — step 1: pick the day you're celebrating. */
@Component({
  selector: 'app-choose-day-page',
  imports: [DaySelector],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-4 py-8">
      <h1 class="heading mb-6 text-3xl text-sindoor">{{ i18n.t('home.chooseDay') }}</h1>
      <app-day-selector />
    </section>
  `,
})
export class ChooseDayPage implements OnInit {
  protected readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.set({ title: this.i18n.t('editor.title'), description: this.i18n.t('home.lead'), path: '/create' });
  }
}
