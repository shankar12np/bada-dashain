import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-xl px-4 py-24 text-center">
      <p class="heading text-6xl text-gold">४०४</p>
      <h1 class="heading mt-4 text-3xl text-sindoor">{{ i18n.t('notFound.title') }}</h1>
      <a routerLink="/" class="btn-primary mt-8">{{ i18n.t('common.home') }}</a>
    </section>
  `,
})
export class NotFoundPage {
  protected readonly i18n = inject(I18nService);
}
