import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';
import { featuredProjects } from '../../../content/projects';
import { notFoundMeta } from '../../../lib/helpers';
import { brokenSystem } from '../../../lib/visuals';
import { SvgComponent } from '../../shared/svg.component';

/**
 * Shown for unknown addresses. Pre-rendered to /404.html, which .htaccess serves
 * for any page that doesn't exist.
 */
@Component({
  selector: 'pf-not-found-page',
  imports: [RouterLink, SvgComponent],
  template: `
    <section class="section not-found" aria-labelledby="nf-title">
      <div class="container nf-grid">
        <div class="nf-copy">
          @if (path(); as p) {
            <p class="nf-request mono">
              <span class="nf-method">GET</span> <span class="nf-path">{{ p }}</span> <span class="nf-status">404 Not Found</span>
            </p>
          }
          <h1 id="nf-title">This page doesn’t exist.</h1>
          <p class="nf-lead">The link may be out of date, or the address may have a typo. Here’s where you can go instead.</p>
          <div class="hero-actions">
            <a class="btn btn--primary" routerLink="/">Go to the home page</a>
            <a class="btn" routerLink="/" fragment="work">See my work</a>
          </div>
          <nav class="nf-links" aria-labelledby="nf-links-title">
            <p class="mono" id="nf-links-title">Case studies</p>
            <ul>
              @for (p of projects; track p.slug) {
                <li><a [routerLink]="['/work', p.slug]" [attr.data-domain]="p.domain">{{ p.title }}</a></li>
              }
            </ul>
          </nav>
        </div>
        <div class="nf-visual"><pf-svg [node]="diagram" /></div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
  protected readonly projects = featuredProjects();
  protected readonly diagram = brokenSystem();
  /** The address that wasn't found; filled in the browser, empty while pre-rendering. */
  protected readonly path = signal('');

  constructor() {
    inject(SeoService).apply(notFoundMeta());
    afterNextRender(() => {
      let p = window.location.pathname;
      try {
        p = decodeURIComponent(p);
      } catch {
        /* keep it encoded */
      }
      if (p === '/not-found' || p === '/404.html') return;
      this.path.set(p.length > 60 ? p.slice(0, 57) + '…' : p);
    });
  }
}
