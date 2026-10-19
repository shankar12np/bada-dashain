import { ChangeDetectionStrategy, Component, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ToastService } from '../../core/ui/toast.service';
import type { TKey } from '../../core/i18n/translations';
import type { Card } from '../../models/card.model';
import { CardRepository } from '../cards/card.repository';

/** `/me` — the signed-in user's cards: delete. */
@Component({
  selector: 'app-my-cards-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-12 md:pt-10">
      <h1 class="heading mb-2 text-3xl text-sindoor">{{ i18n.t('mine.title') }}</h1>
      @if (auth.ready() && !auth.isRegistered()) {
        <div class="mb-6 flex flex-col gap-3 rounded-xl border border-gold/50 bg-cream p-4 text-sm sm:flex-row sm:items-center">
          <span class="sm:flex-1">{{ i18n.t('auth.saveHint') }}</span>
          <button type="button" class="btn-primary self-start py-2 sm:self-auto" (click)="signIn()">{{ i18n.t('auth.signIn') }}</button>
        </div>
      }

      @if (loading()) {
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          @for (i of [1, 2, 3, 4]; track i) { <div class="skeleton aspect-[4/5]"></div> }
        </div>
      } @else if (!cards().length) {
        <div class="py-16 text-center">
          <p class="text-ink-soft">{{ i18n.t('mine.empty') }}</p>
          <a routerLink="/create" class="btn-primary mt-6">{{ i18n.t('home.cta') }}</a>
        </div>
      } @else {
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          @for (c of cards(); track c.id) {
            <div class="overflow-hidden rounded-xl bg-cream shadow-card" [class.opacity-60]="c.status !== 'active'">
              <a [routerLink]="['/c', c.id]"><img [src]="c.thumbUrl" alt="" loading="lazy" class="aspect-[4/5] w-full object-cover" /></a>
              <div class="flex items-center justify-between gap-2 p-2 text-xs">
                <span class="text-ink-soft">🔒 {{ i18n.t('mine.unlisted') }}</span>
                <button type="button" class="text-sindoor hover:underline" (click)="remove(c)">{{ i18n.t('mine.delete') }}</button>
              </div>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class MyCardsPage {
  protected readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  private readonly repo = inject(CardRepository);
  private readonly toast = inject(ToastService);

  protected readonly cards = signal<Card[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    // Reload whenever the signed-in user changes.
    effect(() => {
      const user = this.auth.user();
      const ready = this.auth.ready();
      untracked(() => {
        if (!ready) return;
        if (!user) {
          this.cards.set([]);
          this.loading.set(false);
          return;
        }
        void this.load(user.uid);
      });
    });
  }

  private async load(uid: string): Promise<void> {
    this.loading.set(true);
    try {
      this.cards.set((await this.repo.listMine(uid)).cards);
    } catch (e) {
      console.error('[mine]', e);
      this.toast.error(this.i18n.t('error.generic'));
    } finally {
      this.loading.set(false);
    }
  }

  protected async remove(c: Card): Promise<void> {
    if (!confirm(this.i18n.t('mine.confirmDelete'))) return;
    try {
      await this.repo.delete(c);
      this.cards.update((l) => l.filter((x) => x.id !== c.id));
    } catch {
      this.toast.error(this.i18n.t('error.generic'));
    }
  }

  protected async signIn(): Promise<void> {
    try {
      await this.auth.signInWithGoogle();
    } catch (e) {
      const key = AuthService.errorKey(e) as TKey;
      if (key !== 'auth.cancelled') this.toast.error(this.i18n.t(key));
    }
  }
}
