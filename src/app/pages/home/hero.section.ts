import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { site, copy } from '../../../content/site.config';
import { heroSystem } from '../../../lib/visuals';
import { SvgComponent } from '../../shared/svg.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'pf-hero',
  imports: [SvgComponent, IconComponent],
  template: `
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="container">
        <div class="hero-grid">
          <h1 class="hero-title" id="hero-title">
            @for (line of lines; track $index) {
              <span class="line">{{ line }}</span>
            }
          </h1>
          <div class="hero-copy">
            @if (availability) {
              <p class="availability">{{ availability }}</p>
            }
            <p class="hero-lead">{{ lead }}</p>
            <div class="hero-actions">
              <a class="btn btn--primary" href="#work">Explore my work <pf-icon name="arrow-down" /></a>
              <a class="btn" href="#contact">Let’s connect</a>
            </div>
          </div>
          <div #visual class="hero-visual"><pf-svg [node]="diagram" /></div>
        </div>
        <div class="hero-foot mono">
          <ul class="legend" aria-label="Colour key">
            <li data-domain="product">Interface and product</li>
            <li data-domain="data">Data and AI</li>
            <li data-domain="security">Security</li>
          </ul>
          @if (timeZone) {
            <p class="clock">Local time, {{ timeZoneLabel }}: <time>{{ time() }}</time></p>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  protected readonly lines = copy.heroLines;
  protected readonly lead = copy.heroLead;
  protected readonly availability = site.availability;
  protected readonly timeZone = site.timeZone;
  protected readonly timeZoneLabel = site.timeZoneLabel;
  protected readonly diagram = heroSystem();
  protected readonly time = signal('--:--');

  private readonly visual = viewChild.required<ElementRef<HTMLElement>>('visual');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      // Clock — labelled with its time zone, updated every 15 seconds.
      if (this.timeZone) {
        try {
          const fmt = new Intl.DateTimeFormat('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: this.timeZone });
          const tick = () => this.time.set(fmt.format(new Date()));
          tick();
          const id = setInterval(tick, 15000);
          destroyRef.onDestroy(() => clearInterval(id));
        } catch {
          this.time.set('');
        }
      }

      // Gentle parallax on the diagram's layers (desktop, motion allowed).
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!fine || reduce) return;
      const el = this.visual().nativeElement;
      let raf = 0;
      const move = (e: PointerEvent) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          el.style.setProperty('--px', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
          el.style.setProperty('--py', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
        });
      };
      window.addEventListener('pointermove', move, { passive: true });
      destroyRef.onDestroy(() => window.removeEventListener('pointermove', move));
    });
  }
}
