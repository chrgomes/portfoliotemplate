import { ChangeDetectionStrategy, Component, afterNextRender } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './layout/nav.component';
import { FooterComponent } from './layout/footer.component';
import { CursorComponent } from './layout/cursor.component';
import { PrivacyDialogComponent } from './layout/privacy-dialog.component';

@Component({
  selector: 'pf-root',
  imports: [RouterOutlet, NavComponent, FooterComponent, CursorComponent, PrivacyDialogComponent],
  template: `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="page-grid" aria-hidden="true"><div class="container"></div></div>
    <pf-nav />
    <main id="main" tabindex="-1">
      <router-outlet />
    </main>
    <pf-footer />
    <pf-cursor />
    <pf-privacy-dialog />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    afterNextRender(() => {
      // Opt in to entrance animations only when the visitor allows motion.
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
        document.documentElement.classList.add('js-reveal');
      }
    });
  }
}
