/**
 * Content checks — run with `npm test`. They catch the mistakes that are easy to make
 * when editing the content files by hand.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projects, featuredProjects, statusLabel } from '../../src/content/projects';
import { skillGroups } from '../../src/content/expertise';
import { site } from '../../src/content/site.config';
import { sitemapPaths, projectsUsing } from '../../src/lib/helpers';
import { caseStudySections } from '../../src/lib/case-study';
import { architectureDiagram, dataModelDiagram } from '../../src/lib/diagrams';
import { toSvgString } from '../../src/lib/svg';
import { sitemapXml } from '../seo-files';

test('project slugs are unique and URL-safe', () => {
  const slugs = projects.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of slugs) assert.match(s, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test('four to six projects are featured', () => {
  const n = featuredProjects().length;
  assert.ok(n >= 4 && n <= 6, `featured projects: ${n}`);
});

test('every project has a known status and a non-empty case study', () => {
  for (const p of projects) {
    assert.ok(p.status in statusLabel, `${p.slug}: unknown status ${p.status}`);
    assert.ok(p.caseStudy.overview.length > 20, `${p.slug}: overview too short`);
    assert.ok(caseStudySections(p).length >= 4, `${p.slug}: too few case-study sections`);
  }
});

test('repository and demo links are real URLs when set', () => {
  for (const p of projects) {
    for (const url of [p.repoUrl, p.liveUrl]) {
      if (url !== null) assert.match(url, /^https:\/\//, `${p.slug}: ${url}`);
    }
  }
});

test('architecture edges and data-model relations point at things that exist', () => {
  for (const p of projects) {
    const a = p.caseStudy.architecture;
    if (a) {
      const ids = new Set(a.nodes.map((n) => n.id));
      for (const e of a.edges) assert.ok(ids.has(e.from) && ids.has(e.to), `${p.slug}: edge ${e.from} -> ${e.to}`);
      assert.match(toSvgString(architectureDiagram(a, p.slug)), /^<svg /);
    }
    const m = p.caseStudy.dataModel;
    if (m) {
      const names = new Set(m.tables.map((t) => t.name));
      for (const [x, y] of m.relations) assert.ok(names.has(x) && names.has(y), `${p.slug}: relation ${x} - ${y}`);
      assert.match(toSvgString(dataModelDiagram(m)), /^<svg /);
    }
  }
});

test('skill names are unique within each group', () => {
  for (const g of skillGroups) {
    const names = g.items.map((s) => s.name.toLowerCase());
    assert.equal(new Set(names).size, names.length, g.id);
  }
});

test('"used in" links are derived from project tech lists', () => {
  const angular = projectsUsing('Angular').map((p) => p.slug);
  assert.ok(angular.includes('transportation-management-system'));
  assert.equal(projectsUsing('A skill nobody uses').length, 0);
});

test('sitemap lists the home page and every featured case study', () => {
  const xml = sitemapXml();
  assert.equal(sitemapPaths().length, featuredProjects().length + 1);
  for (const p of featuredProjects()) assert.ok(xml.includes(`/work/${p.slug}/`));
});

test('site URL has no trailing slash and contact links are well formed', () => {
  assert.doesNotMatch(site.siteUrl, /\/$/);
  if (site.contact.email) assert.match(site.contact.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  for (const url of [site.contact.github, site.contact.linkedin]) if (url) assert.match(url, /^https:\/\//);
});
