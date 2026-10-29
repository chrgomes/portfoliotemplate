import { ChangeDetectionStrategy, Component } from '@angular/core';
import { copy, principles } from '../../../content/site.config';
import { glyph } from '../../../lib/visuals';
import { SvgComponent } from '../../shared/svg.component';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'pf-principles',
  imports: [SvgComponent, RevealDirective],
  template: `
    <section class="section section--paper" id="approach" aria-labelledby="approach-title">
      <div class="container">
        <div class="section-head" pfReveal><h2 id="approach-title">{{ title }}</h2></div>
        <ol class="principles">
          @for (p of items; track p.title; let i = $index) {
            <li class="principle" pfReveal>
              <div class="principle-head">
                <pf-svg [node]="p.glyph" /><span class="mono">{{ (i + 1).toString().padStart(2, '0') }}</span>
              </div>
              <h3>{{ p.title }}</h3>
              <p>{{ p.body }}</p>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrinciplesSection {
  protected readonly title = copy.philosophyTitle;
  protected readonly items = principles.map((p) => ({ ...p, glyph: glyph(p.glyph) }));
}
