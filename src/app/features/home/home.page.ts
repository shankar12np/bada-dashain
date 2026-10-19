import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { bsYear, currentFestivalDay, getDay } from '../../data/festival-days';
import { DayIcon } from '../../shared/components/day-icon';
import { DaySelector } from '../days/day-selector';
import type { TKey } from '../../core/i18n/translations';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, DaySelector, DayIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-b from-sindoor-deep via-maroon to-maroon text-cream">
      <div class="mandala-bg pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] opacity-40 motion-safe:animate-[spin_120s_linear_infinite]"
           style="background-size: contain"></div>
      <div class="mandala-bg pointer-events-none absolute -bottom-52 -left-52 h-[30rem] w-[30rem] opacity-25" style="background-size: contain"></div>

      <div class="relative mx-auto max-w-6xl px-4 pb-14 pt-10 md:pb-20 md:pt-16">
        <p class="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/50 px-3 py-1 text-sm text-gold-soft">
          <span class="h-2 w-2 rounded-full bg-gold"></span>
          {{ i18n.t('home.kicker') }} {{ i18n.num(year) }}
        </p>
        <h1 class="heading max-w-3xl text-4xl leading-tight text-gold-soft md:text-6xl">{{ i18n.t('home.title') }}</h1>
        <p class="mt-4 max-w-2xl text-lg text-cream/85">{{ i18n.t('home.lead') }}</p>

        <div class="mt-8 flex flex-wrap gap-3">
          <a [routerLink]="['/create', todayId() ?? 'bijaya-dashami']" class="btn-gold text-lg">{{ i18n.t('home.cta') }} →</a>
        </div>

        @if (today(); as d) {
          <a [routerLink]="['/create', d.id]"
             class="mt-10 flex max-w-xl items-center gap-4 rounded-2xl border border-gold/40 bg-cream/10 p-4 backdrop-blur transition hover:bg-cream/15">
            <span class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-cream">
              <app-day-icon [motif]="d.motif" [size]="40" />
            </span>
            <span>
              <span class="block text-sm text-gold-soft/80">{{ i18n.t('home.today') }}</span>
              <span class="heading block text-2xl text-gold-soft">{{ i18n.pick(d.name) }}</span>
              <span class="line-clamp-2 block text-sm text-cream/80">{{ i18n.pick(d.description) }}</span>
            </span>
          </a>
        }
      </div>
      <div class="dhaka-band"></div>
    </section>

    <!-- Day selector -->
    <section class="mx-auto max-w-6xl px-4 py-12">
      <h2 class="heading mb-6 text-3xl text-sindoor">{{ i18n.t('home.chooseDay') }}</h2>
      <app-day-selector />
    </section>

    <!-- How it works -->
    <section class="border-y border-gold/30 bg-cream/60">
      <div class="mx-auto max-w-6xl px-4 py-12">
        <h2 class="heading mb-8 text-3xl text-sindoor">{{ i18n.t('home.how') }}</h2>
        <ol class="grid gap-6 md:grid-cols-3">
          @for (s of steps; track s; let i = $index) {
            <li class="flex items-start gap-4">
              <span class="heading grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sindoor text-xl text-gold-soft">
                {{ i18n.num(i + 1) }}
              </span>
              <span class="pt-2 text-lg">{{ i18n.t(s) }}</span>
            </li>
          }
        </ol>
        <p class="mt-8 flex items-center gap-2 text-sm text-ink-soft">
          <span aria-hidden="true">🔒</span> {{ i18n.t('home.privacy') }}
        </p>
      </div>
    </section>

  `,
})
export class HomePage implements OnInit {
  protected readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);

  protected readonly year = bsYear();
  protected readonly todayId = computed(() => currentFestivalDay());
  protected readonly today = computed(() => {
    const id = this.todayId();
    return id ? getDay(id) : null;
  });
  protected readonly steps: TKey[] = ['home.step1', 'home.step2', 'home.step3'];

  ngOnInit(): void {
    this.seo.set({
      title: 'Tika · टीका — Dashain & Bijaya Dashami greeting cards',
      description: 'Make a beautiful Dashain / Bijaya Dashami greeting card with your own photo and share it with family. विजया दशमीको शुभकामना कार्ड।',
      path: '/',
    });
  }
}
