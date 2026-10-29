import { ChangeDetectionStrategy, Component, ElementRef, Renderer2, effect, inject, input } from '@angular/core';
import type { SvgNode } from '../../lib/svg';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Renders a generated SvgNode tree (hero diagram, project previews, case-study diagrams).
 * Elements are created one by one with Renderer2 — no innerHTML and no sanitiser bypass —
 * so it works identically during pre-rendering and in the browser.
 */
@Component({
  selector: 'pf-svg',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { ngSkipHydration: 'true', style: 'display: contents' },
})
export class SvgComponent {
  readonly node = input.required<SvgNode>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  constructor() {
    effect(() => {
      const el = this.host.nativeElement;
      for (const child of Array.from(el.childNodes)) this.renderer.removeChild(el, child);
      this.renderer.appendChild(el, this.build(this.node()));
    });
  }

  private build(node: SvgNode | string): unknown {
    if (typeof node === 'string') return this.renderer.createText(node);
    const el = this.renderer.createElement(node.t, SVG_NS);
    for (const [k, v] of Object.entries(node.a ?? {})) {
      if (v !== undefined && v !== '') this.renderer.setAttribute(el, k, String(v));
    }
    for (const c of node.c ?? []) this.renderer.appendChild(el, this.build(c));
    return el;
  }
}
