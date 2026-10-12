import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/i18n/i18n.service';
import { SiteHeader } from './shared/components/site-header';
import { Toasts } from './shared/components/toasts';
import { SavePreview } from './shared/components/save-preview';

/** App shell: header, routed page, footer, toasts. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, Toasts, SavePreview],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-site-header />
    <main id="main">
      <router-outlet />
    </main>
    <footer class="border-t border-gold/30 bg-cream/50 pb-20 md:pb-0">
      <div class="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-8 text-center text-sm text-ink-soft">
        <span class="font-display text-lg text-sindoor">शुभ विजया दशमी</span>
        <span>{{ i18n.t('footer.made') }} 🙏</span>
      </div>
    </footer>
    <app-toasts />
    <app-save-preview />
  `,
})
export class App {
  protected readonly i18n = inject(I18nService);
}
