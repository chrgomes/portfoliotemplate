/**
 * Zero-dependency static build for GoDaddy (or any Apache/static host).
 *
 *   npx tsx tools/static/build.ts            -> dist-static/   (upload to public_html)
 *   npx tsx tools/static/build.ts --preview  -> dist-preview/  (relative links, noindex)
 *
 * Reads the same content files and styles as the Angular app.
 */
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../../src/content/site.config';
import { featuredProjects } from '../../src/content/projects';
import { homeMeta, projectMeta, notFoundMeta, privacyMeta, sitemapPaths, absoluteUrl } from '../../src/lib/helpers';
import { layout, home, caseStudy, notFound, privacy, type RenderOptions } from './render';
import { robotsTxt, sitemapXml } from '../seo-files';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const preview = process.argv.includes('--preview');
const out = join(repo, preview ? 'dist-preview' : 'dist-static');

const STYLE_ORDER = ['tokens', 'base', 'components', 'sections', 'visuals', 'case-study'];

const hash = (s: string): string => createHash('sha256').update(s).digest('hex').slice(0, 10);

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/;}/g, '}')
    .trim();
}

function write(rel: string, content: string): void {
  const file = join(out, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function main(): void {
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  // Styles — fonts are referenced relative to /assets/.
  const css = minifyCss(
    STYLE_ORDER.map((n) => readFileSync(join(repo, 'src/styles', `${n}.css`), 'utf8')).join('\n'),
  ).replace(/url\('\/fonts\//g, "url('../fonts/");
  const cssName = `site.${hash(css)}.css`;
  write(`assets/${cssName}`, css);

  const js = readFileSync(join(here, 'client/site.js'), 'utf8');
  const jsName = `site.${hash(js)}.js`;
  write(`assets/${jsName}`, js);

  // Public files: fonts, icons, social image, manifest, résumé.
  cpSync(join(repo, 'public'), out, {
    recursive: true,
    filter: (src) => !/robots\.txt$|sitemap\.xml$/.test(src),
  });

  const opts = (root: string): RenderOptions => ({ root: preview ? root : '/', preview, css: cssName, js: jsName });

  write('index.html', layout(opts('./'), homeMeta(), home(opts('./')), 'page-home'));
  for (const p of featuredProjects()) {
    const o = opts('../../');
    write(`work/${p.slug}/index.html`, layout(o, projectMeta(p), caseStudy(o, p), 'page-case'));
  }
  {
    const o = opts('../');
    write('privacy/index.html', layout(o, privacyMeta(), privacy(o), 'page-privacy'));
  }
  write('404.html', layout(opts('./'), notFoundMeta(), notFound(opts('./')), 'page-404'));

  if (!preview) {
    write('robots.txt', robotsTxt());
    write('sitemap.xml', sitemapXml());
    cpSync(join(repo, 'hosting/godaddy/.htaccess'), join(out, '.htaccess'));
    cpSync(join(repo, 'hosting/godaddy/contact.php'), join(out, 'contact.php'));
  }

  // Reminders for anything still unconfigured.
  const warnings: string[] = [];
  if (site.name === 'Your Name') warnings.push('site.name is still "Your Name"');
  if (site.siteUrl.includes('example.com')) warnings.push('site.siteUrl is still example.com — canonical URLs and the sitemap will be wrong');
  if (!site.contact.email) warnings.push('contact.email is not set');
  if (!site.contact.github) warnings.push('contact.github is not set');
  if (!site.contact.linkedin) warnings.push('contact.linkedin is not set');
  if (site.contact.resume && !existsSync(join(repo, 'public', site.contact.resume))) warnings.push(`résumé file ${site.contact.resume} is missing from public/`);

  console.log(`Built ${preview ? 'preview' : 'production'} site in ${out}`);
  console.log(`Pages: ${sitemapPaths().map((p) => absoluteUrl(p)).join(', ')} + 404`);
  if (warnings.length) console.log(`\nStill to configure:\n  - ${warnings.join('\n  - ')}`);
}

main();
