/**
 * Generates the favicon set, web manifest and social-sharing image from your
 * name and the hero diagram. Re-run after changing site.config.ts:
 *
 *   npm run assets
 *
 * Needs the `sharp` dev dependency (SVG -> PNG).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { site, copy } from '../src/content/site.config';
import { initials, displayName } from '../src/lib/helpers';
import { toSvgString } from '../src/lib/svg';
import { heroSystem } from '../src/lib/visuals';


const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(repo, 'public');

const COLORS: Record<string, string> = {
  '--c-ink-0': '#080b12',
  '--c-ink-1': '#0b0d12',
  '--c-surface': '#111722',
  '--c-line': 'rgba(154,165,181,0.14)',
  '--c-line-strong': 'rgba(154,165,181,0.3)',
  '--c-text': '#f4f6fa',
  '--c-muted': '#9aa5b5',
  '--c-blue': '#5b8cff',
  '--c-cyan': '#42d9f5',
  '--c-violet': '#8b7cff',
  '--f-mono': "'DejaVu Sans Mono', 'Menlo', monospace",
};

/** The hero rules from visuals.css, with variables resolved and motion removed, for librsvg. */
function heroCss(): string {
  const css = readFileSync(join(repo, 'src/styles/visuals.css'), 'utf8');
  const start = css.indexOf('.hv-face');
  const end = css.indexOf('.hv-plane {');
  return css
    .slice(start, end)
    .replace(/var\((--[\w-]+)\)/g, (_, v: string) => COLORS[v] ?? '#888')
    .replace(/\.hv-packet\s*\{[^}]*\}/, '.hv-packet{opacity:0}');
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function monogramSvg(size: number, withBg: boolean): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="${size}" height="${size}">
${withBg ? '<rect width="40" height="40" rx="9" fill="#080b12"/>' : ''}
<path d="M20 2 L37 11 V29 L20 38 L3 29 V11 Z" fill="${withBg ? 'none' : '#080b12'}" stroke="#f4f6fa" stroke-width="1.6"/>
<path d="M3 11 L20 20 L37 11" fill="none" stroke="#5b8cff" stroke-width="1.6"/>
<text x="20" y="31" text-anchor="middle" font-family="Inter Display, Inter, sans-serif" font-weight="600" font-size="11" fill="#f4f6fa">${esc(initials())}</text>
</svg>`;
}

async function main(): Promise<void> {
  // Favicons
  const favicon = monogramSvg(40, false);
  writeFileSync(join(pub, 'favicon.svg'), favicon);
  await sharp(Buffer.from(monogramSvg(32, true)), { density: 300 }).resize(32, 32).png().toFile(join(pub, 'favicon-32.png'));
  await sharp(Buffer.from(monogramSvg(180, true)), { density: 300 }).resize(180, 180).png().toFile(join(pub, 'apple-touch-icon.png'));
  await sharp(Buffer.from(monogramSvg(512, true)), { density: 300 }).resize(512, 512).png().toFile(join(pub, 'icon-512.png'));

  writeFileSync(
    join(pub, 'site.webmanifest'),
    JSON.stringify(
      {
        name: site.name,
        short_name: displayName(),
        icons: [
          { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        theme_color: '#080b12',
        background_color: '#080b12',
        display: 'standalone',
      },
      null,
      2,
    ),
  );

  // Social image, 1200×630
  const hero = toSvgString(heroSystem()).replace('<svg ', '<svg x="590" y="52" width="600" height="525" ');
  let grid = '';
  for (let x = 72; x < 1200; x += 176) grid += `<line x1="${x}" y1="0" x2="${x}" y2="630" stroke="rgba(154,165,181,0.06)"/>`;
  const lines = copy.heroLines
    .map((l, i) => `<text x="${72 + i * 40}" y="${250 + i * 82}" font-family="Inter Display" font-weight="600" font-size="78" letter-spacing="-3.5" fill="#f4f6fa">${esc(l)}</text>`)
    .join('');
  const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<style>${heroCss()}</style>
<rect width="1200" height="630" fill="#080b12"/>
${grid}
<g transform="translate(72 64)">
  <path d="M20 2 L37 11 V29 L20 38 L3 29 V11 Z" fill="none" stroke="#f4f6fa" stroke-width="1.6"/>
  <path d="M3 11 L20 20 L37 11" fill="none" stroke="#5b8cff" stroke-width="1.6"/>
</g>
<text x="128" y="92" font-family="Inter Display" font-weight="600" font-size="26" fill="#f4f6fa">${esc(site.name)}</text>
${lines}
<text x="72" y="560" font-family="Inter" font-size="24" fill="#9aa5b5">${esc(site.role)}</text>
<rect x="72" y="582" width="28" height="3" fill="#5b8cff"/><rect x="108" y="582" width="28" height="3" fill="#42d9f5"/><rect x="144" y="582" width="28" height="3" fill="#8b7cff"/>
${hero}
</svg>`;
  await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(join(pub, 'og-image.png'));
  console.log('Wrote favicon.svg, favicon-32.png, apple-touch-icon.png, icon-512.png, site.webmanifest, og-image.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
