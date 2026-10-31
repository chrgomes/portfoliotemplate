import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { site } from '../../content/site.config';
import { absoluteUrl, type PageMeta } from '../../lib/helpers';

/** Sets title, description, canonical URL, Open Graph tags and JSON-LD for each page. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly doc = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  apply(page: PageMeta): void {
    const url = absoluteUrl(page.path);
    const image = absoluteUrl('/og-image.png');
    this.title.setTitle(page.title);

    const tags: [string, string, 'name' | 'property'][] = [
      ['description', page.description, 'name'],
      ['og:type', page.type, 'property'],
      ['og:title', page.title, 'property'],
      ['og:description', page.description, 'property'],
      ['og:url', url, 'property'],
      ['og:image', image, 'property'],
      ['og:image:width', '1200', 'property'],
      ['og:image:height', '630', 'property'],
      ['og:image:alt', `${site.name} — ${site.role}`, 'property'],
      ['twitter:card', 'summary_large_image', 'name'],
    ];
    for (const [key, content, attr] of tags) {
      this.meta.updateTag({ [attr]: key, content }, `${attr}="${key}"`);
    }
    if (page.noindex) this.meta.updateTag({ name: 'robots', content: 'noindex' });
    else this.meta.removeTag('name="robots"');

    let canonical = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.doc.createElement('link');
      canonical.rel = 'canonical';
      this.doc.head.appendChild(canonical);
    }
    canonical.href = url;

    this.doc.head.querySelectorAll('script[data-seo]').forEach((s) => s.remove());
    for (const data of page.jsonLd) {
      const script = this.doc.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', '');
      // textContent, not innerHTML: the JSON is never parsed as markup.
      script.textContent = JSON.stringify(data);
      this.doc.head.appendChild(script);
    }
  }
}
