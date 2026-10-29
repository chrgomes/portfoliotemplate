import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { icon, type IconName } from '../../lib/icons';
import { SvgComponent } from './svg.component';

/** Lucide icon, inlined. Decorative: always pair it with visible text or an aria-label. */
@Component({
  selector: 'pf-icon',
  imports: [SvgComponent],
  template: `<pf-svg [node]="node()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class IconComponent {
  readonly name = input.required<IconName>();
  protected readonly node = computed(() => icon(this.name()));
}
