import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { privacySections, privacyUpdated } from '../../content/privacy';
import { IconComponent } from '../shared/icon.component';

/**
 * The privacy notice in a modal. Any link marked data-privacy-link opens it instead of
 * navigating; the /privacy page stays the shareable, indexable version. The notice's
 * text is only rendered once the dialog first opens, so it isn't duplicated in every
 * pre-rendered page. Uses the native <dialog>: focus stays inside, Escape closes it, and
 * focus returns to the link that opened it.
 */
@Component({
  selector: 'pf-privacy-dialog',
  imports: [RouterLink, IconComponent],
  template: `
    <dialog #dlg class="privacy-dialog" aria-labelledby="pd-title" (close)="onClose()" (click)="onDialogClick($event)">
      <div class="pd-inner">
        <header class="pd-head">
          <div>
            <h2 id="pd-title">Privacy notice</h2>
            <p class="pd-updated mono">Last updated <time [attr.datetime]="updated">{{ updatedLabel }}</time></p>
          </div>
          <button class="pd-close" type="button" aria-label="Close privacy notice" (click)="close()"><pf-icon name="x" /></button>
        </header>
        <div #body class="pd-body legal-body" tabindex="0">
          @if (rendered()) {
            @for (s of sections; track s.id) {
              <section [attr.aria-labelledby]="'pd-' + s.id">
                <h3 [id]="'pd-' + s.id">{{ s.title }}</h3>
                @for (p of s.paragraphs ?? []; track $index) {
                  <p>{{ p }}</p>
                }
                @if (s.items?.length) {
                  <ul class="cs-list">
                    @for (item of s.items; track $index) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                }
              </section>
            }
          }
        </div>
        <footer class="pd-foot"><a class="text-link" routerLink="/privacy" (click)="close()">Open as a full page</a></footer>
      </div>
    </dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyDialogComponent {
  protected readonly sections = privacySections().map((s) => ({
    ...s,
    id: s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  }));
  protected readonly updated = privacyUpdated;
  protected readonly updatedLabel = new Date(privacyUpdated + 'T12:00:00Z').toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  protected readonly rendered = signal(false);

  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');
  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof this.dlg().nativeElement.showModal !== 'function') return; // older browser: links just navigate
      // Capture phase, so this runs before routerLink navigates.
      const onClick = (e: MouseEvent) => {
        const a = (e.target as Element | null)?.closest?.('a[data-privacy-link]');
        if (!a || e.defaultPrevented) return;
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new tab etc.
        if (/^\/privacy\/?$/.test(window.location.pathname)) return; // already on the page
        e.preventDefault();
        e.stopPropagation();
        this.open();
      };
      document.addEventListener('click', onClick, true);
      destroyRef.onDestroy(() => document.removeEventListener('click', onClick, true));
    });
  }

  open(): void {
    this.rendered.set(true);
    this.dlg().nativeElement.showModal();
    document.documentElement.classList.add('pd-open');
    this.body().nativeElement.scrollTop = 0;
  }

  protected close(): void {
    this.dlg().nativeElement.close();
  }

  protected onClose(): void {
    document.documentElement.classList.remove('pd-open');
  }

  /** A click on the dimmed area outside the box lands on the dialog element itself. */
  protected onDialogClick(e: MouseEvent): void {
    if (e.target === this.dlg().nativeElement) this.close();
  }
}
