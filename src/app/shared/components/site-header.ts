import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ToastService } from '../../core/ui/toast.service';
import type { TKey } from '../../core/i18n/translations';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-40 bg-maroon/95 text-cream backdrop-blur supports-[backdrop-filter]:bg-maroon/85">
      <div class="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <a routerLink="/" class="flex items-center gap-2" [attr.aria-label]="i18n.t('common.home')">
          <span class="grid h-9 w-9 place-items-center rounded-full bg-sindoor ring-2 ring-gold">
            <span class="h-3 w-3 rounded-full bg-gold-soft"></span>
          </span>
          <span class="font-display text-2xl leading-none text-gold-soft">टीका</span>
          <span class="hidden font-serif text-xl font-bold leading-none text-gold-soft/80 sm:inline">Tika</span>
        </a>

        <nav class="ml-4 hidden items-center gap-1 md:flex">
          @for (l of links; track l.path) {
            <a [routerLink]="l.path" routerLinkActive="bg-sindoor-deep" class="rounded-full px-4 py-2 text-sm hover:bg-sindoor-deep/70">
              {{ i18n.t(l.label) }}
            </a>
          }
        </nav>

        <div class="ml-auto flex items-center gap-2">
          <button type="button" (click)="i18n.toggle()" class="rounded-full border border-gold/50 px-3 py-1.5 text-sm hover:bg-sindoor-deep"
                  [attr.aria-label]="'Switch language'">
            {{ i18n.t('nav.lang') }}
          </button>

          @if (auth.isRegistered()) {
            <div class="relative">
              <button type="button" (click)="menu.set(!menu())" class="flex items-center rounded-full ring-2 ring-gold/60"
                      [attr.aria-expanded]="menu()" aria-haspopup="menu">
                @if (auth.photoURL(); as p) {
                  <img [src]="p" alt="" class="h-9 w-9 rounded-full" referrerpolicy="no-referrer" />
                } @else {
                  <span class="grid h-9 w-9 place-items-center rounded-full bg-gold text-maroon">{{ initial() }}</span>
                }
              </button>
              @if (menu()) {
                <div class="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl bg-paper text-ink shadow-card" role="menu">
                  <p class="truncate border-b border-gold/30 px-4 py-3 text-sm">{{ auth.displayName() }}</p>
                  <a routerLink="/me" (click)="menu.set(false)" class="block px-4 py-3 text-sm hover:bg-cream" role="menuitem">
                    {{ i18n.t('nav.mine') }}
                  </a>
                  <button type="button" (click)="signOut()" class="block w-full px-4 py-3 text-left text-sm hover:bg-cream" role="menuitem">
                    {{ i18n.t('auth.signOut') }}
                  </button>
                </div>
              }
            </div>
          } @else if (auth.ready()) {
            <button type="button" (click)="signIn()" class="rounded-full bg-gold px-4 py-1.5 text-sm font-medium text-maroon hover:bg-gold-soft">
              {{ i18n.t('auth.signIn') }}
            </button>
          }
        </div>
      </div>
      <div class="dhaka-band"></div>
    </header>

    <!-- Mobile bottom navigation: thumbs reach it, like a native app. -->
    <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-gold/40 bg-paper/95 backdrop-blur md:hidden"
         style="padding-bottom: env(safe-area-inset-bottom)">
      <div class="grid grid-cols-3">
        @for (l of links; track l.path) {
          <a [routerLink]="l.path" routerLinkActive="text-sindoor font-medium" class="py-3 text-center text-sm text-ink-soft">
            {{ i18n.t(l.label) }}
          </a>
        }
      </div>
    </nav>
  `,
})
export class SiteHeader {
  protected readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  protected readonly menu = signal(false);

  protected readonly links: { path: string; label: TKey }[] = [
    { path: '/create', label: 'nav.create' },
    { path: '/gallery', label: 'nav.gallery' },
    { path: '/me', label: 'nav.mine' },
  ];

  protected initial(): string {
    return (this.auth.displayName() ?? '?').charAt(0).toUpperCase();
  }

  protected async signIn(): Promise<void> {
    try {
      const u = await this.auth.signInWithGoogle();
      this.toast.success(`${this.i18n.t('auth.welcome')}, ${u.displayName ?? ''}`);
    } catch (e) {
      const key = AuthService.errorKey(e) as TKey;
      if (key !== 'auth.cancelled') this.toast.error(this.i18n.t(key));
    }
  }

  protected async signOut(): Promise<void> {
    this.menu.set(false);
    await this.auth.signOut();
  }
}
