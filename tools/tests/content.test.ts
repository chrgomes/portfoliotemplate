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

test('one to six projects are featured', () => {
  const n = featuredProjects().length;
  assert.ok(n >= 1 && n <= 6, `featured projects: ${n}`);
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
  assert.equal(sitemapPaths().length, featuredProjects().length + 2);
  assert.ok(xml.includes('/privacy/'));
  for (const p of featuredProjects()) assert.ok(xml.includes(`/work/${p.slug}/`));
});

test('site URL has no trailing slash and contact links are well formed', () => {
  assert.doesNotMatch(site.siteUrl, /\/$/);
  if (site.contact.email) assert.match(site.contact.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  for (const url of [site.contact.github, site.contact.linkedin]) if (url) assert.match(url, /^https:\/\//);
});

test('no API keys or secrets in anything the browser receives', async () => {
  const { readdirSync, readFileSync, statSync } = await import('node:fs');
  const { join } = await import('node:path');
  // Everything under these folders ends up in the visitor's browser or the public repo.
  const roots = ['src', 'public', 'tools/static/client'];
  const patterns: [string, RegExp][] = [
    ['OpenAI-style key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}/],
    ['Anthropic key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
    ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
    ['Google API key', /\bAIza[0-9A-Za-z_-]{30,}/],
    ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{30,}/],
    ['Slack token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
    ['Stripe secret key', /\b[rs]k_(?:live|test)_[A-Za-z0-9]{16,}/],
    ['Resend API key', /\bre_[A-Za-z0-9_]{20,}/],
    ['private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
    ['hard-coded secret', /\b(?:api[_-]?key|secret|client[_-]?secret|password|access[_-]?token)\b\s*[:=]\s*['"`][^'"`\s]{12,}['"`]/i],
  ];
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : /\.(ts|js|mjs|html|json|css|webmanifest|txt|xml|svg)$/.test(f) ? [p] : [];
    });
  const hits: string[] = [];
  for (const file of roots.flatMap(walk)) {
    const text = readFileSync(file, 'utf8');
    for (const [label, re] of patterns) if (re.test(text)) hits.push(`${file}: looks like a ${label}`);
  }
  assert.deepEqual(hits, [], 'Secrets belong in contact-config.php on the server, never in front-end files');
});
