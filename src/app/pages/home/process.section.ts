import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { copy, processSteps } from '../../../content/site.config';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'pf-process',
  imports: [RevealDirective],
  template: `
    <section class="section" id="process" aria-labelledby="process-title">
      <div class="container">
        <div class="section-head" pfReveal><h2 id="process-title">{{ title }}</h2></div>
        <ol class="process" [style.--active]="active()">
          @for (s of steps; track s.title; let i = $index) {
            <li class="step" [class.is-active]="i === active()" [class.is-done]="i < active()">
              <button class="step-btn" type="button" [attr.aria-pressed]="i === active()" (click)="active.set(i)" (mouseenter)="hover(i)">
                <span class="step-num">{{ (i + 1).toString().padStart(2, '0') }}</span>
                <h3>{{ s.title }}</h3>
              </button>
              <p>{{ s.body }}</p>
              <p class="output mono">Produces: {{ s.output }}</p>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessSection {
  protected readonly title = copy.processTitle;
  protected readonly steps = processSteps;
  protected readonly active = signal(0);
  private readonly finePointer = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  protected hover(i: number): void {
    if (this.finePointer) this.active.set(i);
  }
}
