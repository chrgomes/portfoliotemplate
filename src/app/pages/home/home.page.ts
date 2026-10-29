import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/seo.service';
import { homeMeta } from '../../../lib/helpers';
import { HeroSection } from './hero.section';
import { WorkSection } from './work.section';
import { ExpertiseSection } from './expertise.section';
import { PrinciplesSection } from './principles.section';
import { AboutSection } from './about.section';
import { ProcessSection } from './process.section';
import { ContactSection } from './contact.section';

@Component({
  selector: 'pf-home-page',
  imports: [HeroSection, WorkSection, ExpertiseSection, PrinciplesSection, AboutSection, ProcessSection, ContactSection],
  template: `
    <pf-hero />
    <pf-work />
    <pf-expertise />
    <pf-principles />
    <pf-about />
    <pf-process />
    <pf-contact />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  constructor() {
    inject(SeoService).apply(homeMeta());
  }
}
