import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';
import { notFoundMeta } from '../../../lib/helpers';

@Component({
  selector: 'pf-not-found-page',
  imports: [RouterLink],
  template: `
    <section class="section not-found">
      <div class="container">
        <p class="mono muted">404</p>
        <h1>This page doesn’t exist.</h1>
        <p class="muted">The link may be out of date, or the address may have a typo.</p>
        <div class="hero-actions">
          <a class="btn btn--primary" routerLink="/">Go to the home page</a>
          <a class="btn" routerLink="/" fragment="work">See my work</a>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
  constructor() {
    inject(SeoService).apply(notFoundMeta());
  }
}
