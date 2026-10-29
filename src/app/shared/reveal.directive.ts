import { Directive, ElementRef, afterNextRender, inject, DestroyRef } from '@angular/core';

/**
 * Restrained entrance animation. Content is visible by default; the effect only applies
 * once JavaScript has added `js-reveal` to <html>, and never with reduced motion.
 * Anything already on screen is shown immediately.
 */
@Directive({
  selector: '[pfReveal]',
  host: { class: 'reveal' },
})
export class RevealDirective {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!document.documentElement.classList.contains('js-reveal')) return;
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('is-visible');
        return;
      }
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            el.classList.add('is-visible');
            io.disconnect();
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
      );
      io.observe(el);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
