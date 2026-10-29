import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { copy } from '../../../content/site.config';
import { skillGroups } from '../../../content/expertise';
import type { SkillGroup, SkillItem } from '../../../content/types';
import { projectsUsing } from '../../../lib/helpers';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'pf-expertise',
  imports: [RouterLink, RevealDirective],
  template: `
    <section class="section" id="expertise" aria-labelledby="expertise-title">
      <div class="container">
        <div class="section-head" pfReveal>
          <h2 id="expertise-title">{{ title }}</h2>
          <p>{{ lead }}</p>
        </div>
        <div class="skills">
          <ul class="skill-tabs" role="tablist" aria-label="Skill areas" aria-orientation="vertical">
            @for (g of groups; track g.id; let i = $index) {
              <li role="presentation">
                <button
                  class="skill-tab"
                  role="tab"
                  [id]="'tab-' + g.id"
                  [attr.aria-controls]="'panel-' + g.id"
                  [attr.aria-selected]="g.id === groupId()"
                  [tabIndex]="g.id === groupId() ? 0 : -1"
                  [attr.data-domain]="g.domain"
                  (click)="groupId.set(g.id)"
                  (keydown)="onTabKey($event, i)"
                >
                  {{ g.title }}<span class="mono">{{ g.items.length }}</span>
                </button>
              </li>
            }
          </ul>
          <div class="skill-panels">
            @for (g of groups; track g.id) {
              <div
                class="skill-panel"
                role="tabpanel"
                [id]="'panel-' + g.id"
                [attr.aria-labelledby]="'tab-' + g.id"
                [attr.data-domain]="g.domain"
                [hidden]="g.id !== groupId()"
              >
                <h3>{{ g.title }}</h3>
                <p>{{ g.summary }}</p>
                <ul class="skill-items" [attr.aria-label]="g.title + ' skills'">
                  @for (s of g.items; track s.name) {
                    <li>
                      <button class="skill" type="button" [attr.aria-pressed]="s.name === selectedFor(g).name" (click)="select(g, s)">
                        {{ s.name }}
                      </button>
                    </li>
                  }
                </ul>
                <div class="skill-detail" aria-live="polite">
                  @let s = selectedFor(g);
                  <strong>{{ s.name }}</strong>
                  @if (s.note) {
                    <p>{{ s.note }}</p>
                  }
                  @let used = usedIn(s.name);
                  @if (used.length) {
                    <p class="used mono">
                      Used in
                      @for (p of used; track p.slug; let last = $last) {
                        <a [routerLink]="['/work', p.slug]">{{ p.title }}</a>{{ last ? '' : ', ' }}
                      }
                    </p>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertiseSection {
  protected readonly title = copy.expertiseTitle;
  protected readonly lead = copy.expertiseLead;
  protected readonly groups = skillGroups;
  protected readonly groupId = signal(skillGroups[0]?.id ?? '');
  private readonly picked = signal<Record<string, string>>({});
  private readonly usedCache = computed(() => new Map(skillGroups.flatMap((g) => g.items).map((s) => [s.name, projectsUsing(s.name)])));

  protected selectedFor(g: SkillGroup): SkillItem {
    const name = this.picked()[g.id];
    return g.items.find((s) => s.name === name) ?? g.items.find((s) => s.note) ?? g.items[0]!;
  }

  protected select(g: SkillGroup, s: SkillItem): void {
    this.picked.update((p) => ({ ...p, [g.id]: s.name }));
  }

  protected usedIn(name: string) {
    return this.usedCache().get(name) ?? [];
  }

  /** Arrow keys, Home and End move between tabs (WAI-ARIA tabs pattern). */
  protected onTabKey(e: KeyboardEvent, i: number): void {
    const n = this.groups.length;
    const next =
      e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (i + 1) % n
      : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (i - 1 + n) % n
      : e.key === 'Home' ? 0
      : e.key === 'End' ? n - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    const g = this.groups[next]!;
    this.groupId.set(g.id);
    document.getElementById('tab-' + g.id)?.focus();
  }
}
