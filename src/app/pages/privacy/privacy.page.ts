import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { privacySections, privacyUpdated } from '../../../content/privacy';
import { privacyMeta } from '../../../lib/helpers';
import { SeoService } from '../../core/seo.service';
import { IconComponent } from '../../shared/icon.component';

const slugify = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

@Component({
  selector: 'pf-privacy-page',
  imports: [RouterLink, IconComponent],
  template: `
    <article class="legal">
      <div class="container">
        <a class="cs-back text-link" routerLink="/"><pf-icon name="arrow-left" />Home</a>
        <h1>Privacy notice</h1>
        <p class="legal-updated mono">Last updated <time [attr.datetime]="updated">{{ updatedLabel }}</time></p>
        <div class="legal-body">
          @for (s of sections; track s.id) {
            <section [attr.aria-labelledby]="'pv-' + s.id">
              <h2 [id]="'pv-' + s.id">{{ s.title }}</h2>
              @for (p of s.paragraphs ?? []; track $index) {
                <p>{{ p }}</p>
              }
              @if (s.items?.length) {
                <ul class="cs-list">
                  @for (item of s.items; track $index) {
                    <li>{{ item }}</li>
                  }
                </ul>
              }
            </section>
          }
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPage {
  protected readonly sections = privacySections().map((s) => ({ ...s, id: slugify(s.title) }));
  protected readonly updated = privacyUpdated;
  protected readonly updatedLabel = new Date(privacyUpdated + 'T12:00:00Z').toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  constructor() {
    inject(SeoService).apply(privacyMeta());
  }
}
