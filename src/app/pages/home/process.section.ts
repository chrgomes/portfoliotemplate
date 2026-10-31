import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { copy, processSteps } from '../../../content/site.config';
import { processGlyph } from '../../../lib/visuals';
import { SvgComponent } from '../../shared/svg.component';
import { RevealDirective } from '../../shared/reveal.directive';

/**
 * The development process timeline.
 *
 * Click or hover a step to select it. With motion allowed, the line also fills as the
 * visitor scrolls, a dot rides its tip, and each step (and its glyph) lights up when
 * reached. With reduced motion it's a plain, click-to-select timeline.
 * Same behaviour as the static build (tools/static/client/site.js).
 */
@Component({
  selector: 'pf-process',
  imports: [SvgComponent, RevealDirective],
  template: `
    <section class="section" id="process" aria-labelledby="process-title">
      <div class="container">
        <div class="section-head" pfReveal><h2 id="process-title">{{ title }}</h2></div>
        <div #wrap class="process-wrap">
          <ol #list class="process" [style.--active]="active() < 0 ? 0 : active()">
            @for (s of steps; track s.title; let i = $index) {
              <li class="step" [class.is-active]="i === active()" [class.is-done]="i < active()">
                <button class="step-btn" type="button" [attr.aria-pressed]="i === active()" (click)="select(i)" (mouseenter)="hover(i)">
                  <span class="step-num">{{ (i + 1).toString().padStart(2, '0') }}</span>
                  <h3><pf-svg [node]="s.icon" />{{ s.title }}</h3>
                </button>
                <p>{{ s.body }}</p>
                <p class="output mono">Produces: {{ s.output }}</p>
              </li>
            }
          </ol>
          <span class="process-dot" aria-hidden="true"></span>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessSection {
  protected readonly title = copy.processTitle;
  protected readonly steps = processSteps.map((s) => ({ ...s, icon: processGlyph(s.glyph) }));
  /** Index of the current step; -1 before the visitor reaches the timeline. */
  protected readonly active = signal(0);

  private readonly wrap = viewChild.required<ElementRef<HTMLElement>>('wrap');
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');
  private readonly destroyRef = inject(DestroyRef);

  private animated = false;
  private finePointer = false;
  private manual: number | null = null;
  private manualY = 0;
  private centers: number[] = [];
  private queued = false;
  private vertical?: MediaQueryList;

  constructor() {
    afterNextRender(() => {
      this.finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      this.animated = true;
      document.documentElement.classList.add('js-process-anim');
      this.vertical = window.matchMedia('(max-width: 900px)');

      const onScroll = () => {
        // Scrolling on hands control back to the scroll position.
        if (this.manual !== null && Math.abs(window.scrollY - this.manualY) > 60) this.manual = null;
        this.queue();
      };
      const remeasure = () => {
        this.measure();
        this.queue();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', remeasure);
      document.fonts?.ready.then(remeasure);
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', remeasure);
        document.documentElement.classList.remove('js-process-anim');
      });
      this.measure();
      this.update();
    });
  }

  protected select(i: number): void {
    if (!this.animated) {
      this.active.set(i);
      return;
    }
    this.manual = i;
    this.manualY = window.scrollY;
    this.queue();
  }

  protected hover(i: number): void {
    if (this.finePointer) this.select(i);
  }

  /** Where each numbered circle sits along the line, relative to the list. */
  private measure(): void {
    const list = this.list().nativeElement;
    const r = list.getBoundingClientRect();
    const vertical = this.vertical?.matches ?? false;
    this.centers = Array.from(list.querySelectorAll<HTMLElement>('.step-num')).map((n) => {
      const b = n.getBoundingClientRect();
      return vertical ? b.top + b.height / 2 - r.top : b.left + b.width / 2 - r.left;
    });
    const wrap = this.wrap().nativeElement;
    wrap.style.setProperty('--p-start', `${this.centers[0]}px`);
    wrap.style.setProperty('--p-end', `${this.centers[this.centers.length - 1]}px`);
  }

  private queue(): void {
    if (this.queued) return;
    this.queued = true;
    requestAnimationFrame(() => this.update());
  }

  private update(): void {
    this.queued = false;
    const first = this.centers[0] ?? 0;
    const last = this.centers[this.centers.length - 1] ?? 0;
    let pos: number;
    let active = -1;
    if (this.manual !== null) {
      pos = this.centers[this.manual] ?? first;
      active = this.manual;
    } else {
      const r = this.list().nativeElement.getBoundingClientRect();
      const vh = window.innerHeight;
      // Desktop: fills while the list moves from 85% to 35% of the screen height.
      // Phones (steps stacked): the fill follows a point 60% down the screen.
      let p = this.vertical?.matches ? (vh * 0.6 - (r.top + first)) / (last - first) : (vh * 0.85 - r.top) / (vh * 0.5);
      p = Math.max(0, Math.min(1, p));
      pos = first + (last - first) * p;
      if (p > 0) this.centers.forEach((c, i) => pos >= c - 1 && (active = i));
    }
    const wrap = this.wrap().nativeElement;
    wrap.style.setProperty('--p-pos', `${pos}px`);
    wrap.style.setProperty('--p-dot', active >= 0 ? '1' : '0');
    this.active.set(active);
  }
}
