import { ChangeDetectionStrategy, Component } from '@angular/core';
import { site } from '../../content/site.config';
import { initials } from '../../lib/helpers';
import { monogram } from '../../lib/visuals';
import { SvgComponent } from '../shared/svg.component';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'pf-footer',
  imports: [SvgComponent, IconComponent],
  template: `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-left">
          <pf-svg [node]="mark" />
          <span>© {{ year }} {{ name }}</span>
        </div>
        @if (contact.github || contact.linkedin || contact.email) {
          <ul class="footer-links">
            @if (contact.github) {
              <li><a [href]="contact.github" rel="me noopener" target="_blank"><pf-icon name="github" />GitHub</a></li>
            }
            @if (contact.linkedin) {
              <li><a [href]="contact.linkedin" rel="me noopener" target="_blank"><pf-icon name="linkedin" />LinkedIn</a></li>
            }
            @if (contact.email) {
              <li><a [href]="'mailto:' + contact.email"><pf-icon name="mail" />Email</a></li>
            }
          </ul>
        }
        <button class="to-top" type="button" (click)="toTop()">Back to top <pf-icon name="arrow-up" /></button>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly name = site.name;
  protected readonly contact = site.contact;
  protected readonly mark = monogram(initials(), 28);
  /** Evaluated at build time and again in the browser, so the year is always current. */
  protected readonly year = new Date().getFullYear();

  protected toTop(): void {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    document.getElementById('main')?.focus({ preventScroll: true });
  }
}
