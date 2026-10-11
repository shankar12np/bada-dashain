import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface SeoData {
  title: string;
  description: string;
  image?: string;
  path?: string;
}

/**
 * Client-side meta tags. Google renders JS and will pick these up.
 * Note: WhatsApp / Facebook crawlers do NOT run JS — for shared card links
 * the `cardPage` Cloud Function injects the same tags server-side.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  set({ title, description, image, path }: SeoData): void {
    const fullTitle = title.includes('Tika') ? title : `${title} · Tika`;
    const url = environment.siteUrl + (path ?? '');
    const img = image ?? `${environment.siteUrl}/og-default.jpg`;
    this.title.setTitle(fullTitle);
    const tags: [string, string, 'name' | 'property'][] = [
      ['description', description, 'name'],
      ['og:title', fullTitle, 'property'],
      ['og:description', description, 'property'],
      ['og:image', img, 'property'],
      ['og:url', url, 'property'],
      ['og:type', 'website', 'property'],
      ['twitter:card', 'summary_large_image', 'name'],
      ['twitter:title', fullTitle, 'name'],
      ['twitter:description', description, 'name'],
      ['twitter:image', img, 'name'],
    ];
    for (const [key, content, attr] of tags) {
      this.meta.updateTag({ [attr]: key, content });
    }
  }
}
