import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { projectBySlug, statusLabel } from '../../../content/projects';
import { caseStudySections, pad2 } from '../../../lib/case-study';
import { projectMeta, nextProject, notFoundMeta } from '../../../lib/helpers';
import { projectPreview } from '../../../lib/visuals';
import { architectureDiagram, dataModelDiagram } from '../../../lib/diagrams';
import type { Architecture } from '../../../content/types';
import { SeoService } from '../../core/seo.service';
import { SvgComponent } from '../../shared/svg.component';
import { IconComponent } from '../../shared/icon.component';
import { RevealDirective } from '../../shared/reveal.directive';
import { NotFoundPage } from '../not-found/not-found.page';

@Component({
  selector: 'pf-project-page',
  imports: [RouterLink, SvgComponent, IconComponent, RevealDirective, NotFoundPage],
  template: `
    @if (project(); as p) {
      <article class="case-study" [attr.data-domain]="p.domain">
        <header class="cs-hero">
          <div class="container">
            <a class="cs-back text-link" routerLink="/" fragment="work"><pf-icon name="arrow-left" />All work</a>
            <div class="cs-hero-grid">
              <h1>{{ p.title }}</h1>
              <p class="cs-summary">{{ p.summary }}</p>
            </div>
            <dl class="cs-meta">
              <div><dt>Category</dt><dd>{{ p.category }}</dd></div>
              <div><dt>Status</dt><dd><span class="status status--{{ p.status }}">{{ statusLabel[p.status] }}</span></dd></div>
              <div><dt>Stack</dt><dd>{{ p.tech.join(', ') }}</dd></div>
              <div>
                <dt>Links</dt>
                <dd class="cs-links">
                  @if (p.repoUrl) {
                    <a class="text-link" [href]="p.repoUrl" target="_blank" rel="noopener"><pf-icon name="github" />Source on GitHub</a>
                  } @else {
                    <span class="muted">No public repository yet</span>
                  }
                  @if (p.liveUrl) {
                    <a class="text-link" [href]="p.liveUrl" target="_blank" rel="noopener">Live demo <pf-icon name="arrow-up-right" /></a>
                  } @else {
                    <span class="muted">No live demo yet</span>
                  }
                </dd>
              </div>
            </dl>
            <div class="cs-media card-media">
              @if (p.image) {
                <img [src]="p.image.src" [alt]="p.image.alt" [width]="p.image.width" [height]="p.image.height" />
              } @else {
                <pf-svg [node]="preview()!" />
                <span class="media-label mono">Concept visual, not a screenshot</span>
              }
            </div>
          </div>
        </header>

        <div class="container cs-body">
          <nav class="cs-toc" aria-label="On this page">
            <p class="mono">On this page</p>
            <ol>
              @for (s of sections(); track s.id; let i = $index) {
                <li>
                  <a [routerLink]="[]" [fragment]="s.id" [attr.aria-current]="current() === s.id ? 'true' : null">
                    <span class="mono">{{ pad2(i + 1) }}</span>{{ s.title }}
                  </a>
                </li>
              }
            </ol>
          </nav>

          <div class="cs-content">
            @for (s of sections(); track s.id; let i = $index) {
              <section class="cs-section" [id]="s.id" [attr.aria-labelledby]="s.id + '-h'" pfReveal>
                <h2 [id]="s.id + '-h'"><span class="mono">{{ pad2(i + 1) }}</span>{{ s.title }}</h2>
                @if (s.kind === 'lede') {
                  <p class="cs-lede">{{ s.text }}</p>
                } @else if (s.kind === 'text') {
                  <p>{{ s.text }}</p>
                } @else if (s.kind === 'list') {
                  <ul class="cs-list">@for (item of s.items; track item) { <li>{{ item }}</li> }</ul>
                } @else if (s.kind === 'tags') {
                  <ul class="tags">@for (t of s.items; track t) { <li>{{ t }}</li> }</ul>
                } @else if (s.kind === 'status') {
                    <p><span class="status status--{{ s.status }}">{{ statusLabel[s.status] }}</span></p>
                    <p>{{ s.text }}</p>
                } @else if (s.kind === 'decisions') {
                    <div class="cs-decisions">
                      @for (d of s.decisions; track d.title) {
                        <div><h3>{{ d.title }}</h3><p>{{ d.body }}</p></div>
                      }
                    </div>
                } @else if (s.kind === 'architecture') {
                    <figure class="cs-figure">
                      <p class="scroll-hint mono" aria-hidden="true">Swipe sideways to see the whole diagram</p>
                      <div class="diagram-scroll" tabindex="0" role="region" aria-label="Architecture diagram, scrolls sideways on small screens">
                        <pf-svg [node]="archDiagram()!" />
                      </div>
                      <figcaption>{{ s.architecture.caption }}</figcaption>
                    </figure>
                    <details class="cs-alt">
                      <summary>Read the diagram as text</summary>
                      <dl>
                        @for (n of s.architecture.nodes; track n.id) {
                          <div><dt>{{ n.label }}</dt><dd>{{ n.detail }}</dd></div>
                        }
                      </dl>
                      <ul class="cs-list">
                        @for (e of s.architecture.edges; track $index) {
                          <li>{{ label(s.architecture, e.from) }} to {{ label(s.architecture, e.to) }}@if (e.label) { ({{ e.label }}) }</li>
                        }
                      </ul>
                    </details>
                } @else if (s.kind === 'data-model') {
                    <figure class="cs-figure">
                      <p class="scroll-hint mono" aria-hidden="true">Swipe sideways to see the whole diagram</p>
                      <div class="diagram-scroll" tabindex="0" role="region" aria-label="Database diagram, scrolls sideways on small screens">
                        <pf-svg [node]="dataDiagram()!" />
                      </div>
                      <figcaption>{{ s.dataModel.caption }}</figcaption>
                    </figure>
                    <details class="cs-alt">
                      <summary>Read the tables as text</summary>
                      <dl>
                        @for (t of s.dataModel.tables; track t.name) {
                          <div><dt>{{ t.name }}</dt><dd class="mono">{{ t.fields.join(', ') }}</dd></div>
                        }
                      </dl>
                    </details>
                }
              </section>
            }
          </div>
        </div>

        @if (next(); as n) {
          <nav class="cs-next" aria-label="Next case study">
            <div class="container">
              <a [routerLink]="['/work', n.slug]" [attr.data-domain]="n.domain">
                <span class="mono">Next case study</span>
                <span class="cs-next-title">{{ n.title }} <pf-icon name="arrow-right" /></span>
              </a>
            </div>
          </nav>
        }
      </article>
    } @else {
      <pf-not-found-page />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPage {
  /** Bound from the :slug route parameter. */
  readonly slug = input.required<string>();

  protected readonly statusLabel = statusLabel;
  protected readonly pad2 = pad2;
  protected readonly project = computed(() => {
    const p = projectBySlug(this.slug());
    return p?.featured ? p : undefined;
  });
  protected readonly sections = computed(() => {
    const p = this.project();
    return p ? caseStudySections(p) : [];
  });
  protected readonly preview = computed(() => {
    const p = this.project();
    return p ? projectPreview(p.preview, p.title) : null;
  });
  protected readonly archDiagram = computed(() => {
    const p = this.project();
    return p?.caseStudy.architecture ? architectureDiagram(p.caseStudy.architecture, p.slug) : null;
  });
  protected readonly dataDiagram = computed(() => {
    const p = this.project();
    return p?.caseStudy.dataModel ? dataModelDiagram(p.caseStudy.dataModel) : null;
  });
  protected readonly next = computed(() => {
    const p = this.project();
    return p ? nextProject(p) : null;
  });
  protected readonly current = signal<string | null>(null);

  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  private spy?: IntersectionObserver;

  constructor() {
    effect(() => {
      const p = this.project();
      this.seo.apply(p ? projectMeta(p) : notFoundMeta());
    });

    // Highlight the current section in the contents list.
    afterNextRender(() => {
      this.spy = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && this.current.set(e.target.id)),
        { rootMargin: '-45% 0px -50% 0px' },
      );
      document.querySelectorAll('.cs-section').forEach((el) => this.spy!.observe(el));
      this.destroyRef.onDestroy(() => this.spy?.disconnect());
    });
  }

  protected label(a: Architecture, id: string): string {
    return a.nodes.find((n) => n.id === id)?.label ?? id;
  }
}
