import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { copy } from '../../../content/site.config';
import { featuredProjects, statusLabel } from '../../../content/projects';
import type { Project } from '../../../content/types';
import { projectPreview } from '../../../lib/visuals';
import { SvgComponent } from '../../shared/svg.component';
import { IconComponent } from '../../shared/icon.component';
import { RevealDirective } from '../../shared/reveal.directive';

/** Card widths in a 12-column grid, giving the gallery an editorial rhythm. */
const WIDTHS = ['w7', 'w5', 'w5', 'w7', 'w12', 'w12'];

@Component({
  selector: 'pf-work',
  imports: [RouterLink, SvgComponent, IconComponent, RevealDirective],
  template: `
    <section class="section" id="work" aria-labelledby="work-title">
      <div class="container">
        <div class="section-head" pfReveal>
          <h2 id="work-title">{{ title }}</h2>
          <p>{{ lead }}</p>
        </div>
        <div class="work-grid">
          @for (p of projects; track p.slug; let i = $index) {
            <article class="card card--{{ width(i) }}" [attr.data-domain]="p.domain" data-cursor="Read" pfReveal>
              <div class="card-media" (pointermove)="tilt($event)" (pointerleave)="untilt($event)">
                @if (p.image) {
                  <img [src]="p.image.src" [alt]="p.image.alt" [width]="p.image.width" [height]="p.image.height" loading="lazy" decoding="async" />
                } @else {
                  <pf-svg [node]="preview(p)" />
                  <span class="media-label mono">Concept visual, not a screenshot</span>
                }
              </div>
              <div class="card-body">
                <div class="card-meta">
                  <span class="mono">{{ p.category }}</span>
                  <span class="status status--{{ p.status }}">{{ statusLabel[p.status] }}</span>
                </div>
                <h3><a class="card-link" [routerLink]="['/work', p.slug]">{{ p.title }}</a></h3>
                <p>{{ p.summary }}</p>
                <ul class="tags" aria-label="Technology">
                  @for (t of p.tech; track t) {
                    <li>{{ t }}</li>
                  }
                </ul>
                <div class="card-actions">
                  <span class="text-link" aria-hidden="true">Read the case study</span>
                  @if (p.repoUrl) {
                    <a class="text-link ext" [href]="p.repoUrl" target="_blank" rel="noopener"><pf-icon name="github" />Source</a>
                  }
                  @if (p.liveUrl) {
                    <a class="text-link ext" [href]="p.liveUrl" target="_blank" rel="noopener">Live demo <pf-icon name="arrow-up-right" /></a>
                  }
                  @if (!p.repoUrl && !p.liveUrl) {
                    <span class="note mono">No public repo or demo yet</span>
                  }
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkSection {
  protected readonly title = copy.workTitle;
  protected readonly lead = copy.workLead;
  protected readonly projects = featuredProjects();
  protected readonly statusLabel = statusLabel;
  private readonly previews = new Map(this.projects.map((p) => [p.slug, projectPreview(p.preview, p.title)]));
  private readonly canTilt =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected width(i: number): string {
    return WIDTHS[i] ?? 'w12';
  }

  protected preview(p: Project) {
    return this.previews.get(p.slug)!;
  }

  protected tilt(e: PointerEvent): void {
    if (!this.canTilt) return;
    const m = e.currentTarget as HTMLElement;
    const r = m.getBoundingClientRect();
    m.style.setProperty('--rx', `${(((e.clientX - r.left) / r.width - 0.5) * 6).toFixed(2)}deg`);
    m.style.setProperty('--ry', `${(((e.clientY - r.top) / r.height - 0.5) * -5).toFixed(2)}deg`);
  }

  protected untilt(e: PointerEvent): void {
    const m = e.currentTarget as HTMLElement;
    m.style.setProperty('--rx', '0deg');
    m.style.setProperty('--ry', '0deg');
  }
}
