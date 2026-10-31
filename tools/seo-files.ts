/**
 * robots.txt and sitemap.xml, generated from site.config.ts and the project list.
 * Run directly (npm run seo) to write them into public/ for the Angular build.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sitemapPaths, absoluteUrl } from '../src/lib/helpers';

export const robotsTxt = (): string => `User-agent: *
Allow: /
Disallow: /contact.php

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;

export function sitemapXml(): string {
  // No <lastmod>: a build date on every page would be inaccurate, and search engines
  // ignore sitemaps whose dates can't be trusted.
  const urls = sitemapPaths()
    .map((p) => `  <url><loc>${absoluteUrl(p)}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
  writeFileSync(join(pub, 'robots.txt'), robotsTxt());
  writeFileSync(join(pub, 'sitemap.xml'), sitemapXml());
  console.log('Wrote public/robots.txt and public/sitemap.xml');
}
