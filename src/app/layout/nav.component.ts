import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { displayName, initials } from '../../lib/helpers';
import { monogram } from '../../lib/visuals';
import { SvgComponent } from '../shared/svg.component';

interface NavItem {
  id: string;
  label: string;
}

@Component({
  selector: 'pf-nav',
  imports: [RouterLink, SvgComponent],
  template: `
    <header class="site-nav" [class.is-scrolled]="scrolled()">
      <div class="container">
        <a class="brand" routerLink="/" [attr.aria-label]="name + ', home'">
          <pf-svg [node]="mark" /><span>{{ name }}</span>
        </a>
        <nav aria-label="Primary">
          <ul class="nav-links">
            @for (item of items; track item.id) {
              <li>
                <a routerLink="/" [fragment]="item.id" [attr.aria-current]="active() === item.id ? 'true' : null">{{ item.label }}</a>
              </li>
            }
          </ul>
        </nav>
        <a class="btn btn--primary nav-cta" routerLink="/" fragment="contact">Let’s talk</a>
        <button
          #toggle
          class="nav-toggle"
          type="button"
          aria-controls="nav-sheet"
          [attr.aria-expanded]="open()"
          [attr.aria-label]="open() ? 'Close menu' : 'Open menu'"
          (click)="setOpen(!open())"
        >
          <span></span><span></span>
        </button>
      </div>
      <div #sheet class="nav-sheet" id="nav-sheet" [hidden]="!open()" (keydown)="trapFocus($event)">
        <nav aria-label="Mobile">
          <ul>
            @for (item of items; track item.id; let i = $index) {
              <li>
                <a routerLink="/" [fragment]="item.id" (click)="setOpen(false)">
                  {{ item.label }}<span class="mono">{{ (i + 1).toString().padStart(2, '0') }}</span>
                </a>
              </li>
            }
          </ul>
        </nav>
        <a class="btn btn--primary" routerLink="/" fragment="contact" (click)="setOpen(false)">Let’s talk</a>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onScroll()',
    '(document:keydown.escape)': 'closeFromKeyboard()',
  },
})
export class NavComponent {
  protected readonly name = displayName();
  protected readonly mark = monogram(initials());
  protected readonly items: NavItem[] = [
    { id: 'top', label: 'Home' },
    { id: 'work', label: 'Work' },
    { id: 'expertise', label: 'Expertise' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  protected readonly scrolled = signal(false);
  protected readonly open = signal(false);
  protected readonly active = signal<string | null>(null);

  private readonly toggle = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');
  private readonly sheet = viewChild.required<ElementRef<HTMLElement>>('sheet');
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private spy?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      this.onScroll();
      this.watchSections();
      this.router.events
        .pipe(
          filter((e) => e instanceof NavigationEnd),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => setTimeout(() => this.watchSections()));
      const wide = window.matchMedia('(min-width: 861px)');
      const close = (m: MediaQueryListEvent) => m.matches && this.setOpen(false);
      wide.addEventListener('change', close);
      this.destroyRef.onDestroy(() => {
        wide.removeEventListener('change', close);
        this.spy?.disconnect();
      });
    });
  }

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  protected setOpen(open: boolean): void {
    this.open.set(open);
    document.body.classList.toggle('nav-open', open);
    if (open) setTimeout(() => this.sheet().nativeElement.querySelector<HTMLElement>('a')?.focus());
  }

  protected closeFromKeyboard(): void {
    if (!this.open()) return;
    this.setOpen(false);
    this.toggle().nativeElement.focus();
  }

  /** Keep keyboard focus inside the open mobile menu. */
  protected trapFocus(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    const items = [this.toggle().nativeElement, ...Array.from(this.sheet().nativeElement.querySelectorAll<HTMLElement>('a'))];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (!e.shiftKey && i === items.length - 1) {
      e.preventDefault();
      items[0]?.focus();
    }
  }

  /** Highlight the section in view — home page only. */
  private watchSections(): void {
    this.spy?.disconnect();
    this.active.set(null);
    const sections = this.items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;
    this.spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && this.active.set(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => this.spy!.observe(s));
  }
}
