import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import type { Bilingual, Lang } from '../../models/festival.model';
import { T, type TKey } from './translations';
import { toNepaliDigits } from '../../data/festival-days';

const STORAGE_KEY = 'tika.lang';

/**
 * Runtime bilingual support (Nepali ⇄ English) with a signal.
 *
 * Why not Angular's built-in i18n? It compiles one build per locale and needs
 * a reload to switch. Here users flip languages instantly, and both scripts
 * appear side by side on the same page — which is how Nepali families actually
 * read (Devanagari greeting, English UI, or vice versa).
 *
 * Templates call `i18n.t('key')`; because `t()` reads the `lang` signal,
 * Angular re-renders automatically when the language changes.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly doc = inject(DOCUMENT);
  readonly lang = signal<Lang>(this.initialLang());

  constructor() {
    effect(() => {
      const lang = this.lang();
      this.doc.documentElement.lang = lang === 'ne' ? 'ne' : 'en';
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        /* private mode — ignore */
      }
    });
  }

  t(key: TKey): string {
    return T[key][this.lang()];
  }

  /** Pick the current language from a bilingual value. */
  pick(value: Bilingual | undefined | null): string {
    return value ? value[this.lang()] : '';
  }

  /** Numbers in the current script (२०८३ vs 2083). */
  num(n: number | string): string {
    return this.lang() === 'ne' ? toNepaliDigits(n) : String(n);
  }

  toggle(): void {
    this.lang.update((l) => (l === 'ne' ? 'en' : 'ne'));
  }

  private initialLang(): Lang {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ne' || saved === 'en') return saved;
    } catch {
      /* ignore */
    }
    // Nepali by default for Nepali/Hindi browsers; English for the diaspora's devices.
    const nav = (typeof navigator !== 'undefined' && navigator.language) || 'en';
    return /^(ne|hi)/i.test(nav) ? 'ne' : 'en';
  }
}
