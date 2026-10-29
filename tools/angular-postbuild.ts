/**
 * Runs after `ng build`. Makes the pre-rendered not-found page Apache's 404 page and
 * reports what to upload.
 */
import { copyFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist/portfolio/browser');
if (!existsSync(out)) {
  console.error(`Build output not found at ${out}`);
  process.exit(1);
}

const notFound = join(out, 'not-found/index.html');
if (existsSync(notFound)) copyFileSync(notFound, join(out, '404.html'));

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const pages = walk(out).filter((f) => f.endsWith('.html')).map((f) => relative(out, f));

console.log(`\nReady to upload: ${out}`);
console.log(`Pages:\n  ${pages.join('\n  ')}`);
for (const f of ['.htaccess', 'contact.php', 'robots.txt', 'sitemap.xml', '404.html']) {
  if (!existsSync(join(out, f))) console.warn(`Warning: ${f} is missing from the build output`);
}
