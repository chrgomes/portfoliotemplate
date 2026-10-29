import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * A soft ring that follows the pointer and labels project cards ("Read").
 * Desktop with a fine pointer only; never replaces the system cursor; off with reduced motion.
 * Cards opt in with a data-cursor="Label" attribute.
 */
@Component({
  selector: 'pf-cursor',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'cursor-ring', 'aria-hidden': 'true' },
})
export class CursorComponent {
  constructor() {
    const ring = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!fine || reduce) return;

      const move = (e: PointerEvent) => {
        ring.style.setProperty('--x', `${e.clientX}px`);
        ring.style.setProperty('--y', `${e.clientY}px`);
        const target = (e.target as Element | null)?.closest<HTMLElement>('[data-cursor]');
        if (target) ring.textContent = target.dataset['cursor'] ?? '';
        ring.classList.toggle('is-active', !!target);
      };
      window.addEventListener('pointermove', move, { passive: true });
      destroyRef.onDestroy(() => window.removeEventListener('pointermove', move));
    });
  }
}
