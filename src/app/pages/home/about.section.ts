import { ChangeDetectionStrategy, Component } from '@angular/core';
import { copy } from '../../../content/site.config';
import { about } from '../../../content/about';
import type { Credential } from '../../../content/types';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'pf-about',
  imports: [RevealDirective],
  template: `
    <section class="section" id="about" aria-labelledby="about-title">
      <div class="container about">
        <div class="about-copy" pfReveal>
          <h2 id="about-title">{{ title }}</h2>
          <p class="lede">{{ lede }}</p>
          <div class="prose">
            @for (p of rest; track $index) {
              <p>{{ p }}</p>
            }
          </div>
        </div>
        <dl class="dossier" pfReveal>
          @for (block of credentialBlocks; track block.title) {
            @if (block.items.length) {
              <div>
                <dt>{{ block.title }}</dt>
                <dd>
                  <ul>
                    @for (c of block.items; track c.title) {
                      <li>
                        {{ c.title }}
                        @if (sub(c); as s) {
                          <span class="sub">{{ s }}</span>
                        }
                        @if (c.note) {
                          <span class="sub">{{ c.note }}</span>
                        }
                      </li>
                    }
                  </ul>
                </dd>
              </div>
            }
          }
          @for (block of textBlocks; track block.title) {
            @if (block.items.length) {
              <div>
                <dt>{{ block.title }}</dt>
                <dd>
                  <ul>
                    @for (item of block.items; track item) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                </dd>
              </div>
            }
          }
        </dl>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutSection {
  protected readonly title = copy.aboutTitle;
  protected readonly lede = about.intro[0] ?? '';
  protected readonly rest = about.intro.slice(1);
  protected readonly credentialBlocks = [
    { title: 'Education', items: about.education },
    { title: 'Certifications', items: about.certifications },
  ];
  protected readonly textBlocks = [
    { title: 'Experience', items: about.background },
    { title: 'Currently learning', items: about.learning },
    { title: 'Interests', items: about.interests },
  ];

  protected sub(c: Credential): string {
    return [c.institution, c.year].filter(Boolean).join(', ');
  }
}
