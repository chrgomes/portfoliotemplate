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
import { displayName, initials } from '../src/lib/helpers';
import { toSvgString } from '../src/lib/svg';
import { heroSystem } from '../src/lib/visuals';


const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(repo, 'public');

const COLORS: Record<string, string> = {
  '--c-ink-0': '#101a33',
  '--c-ink-1': '#14203d',
  '--c-surface': '#1a2848',
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
  const RGB: Record<string, string> = { gray: '154,165,181', blue: '91,140,255', cyan: '66,217,245', violet: '139,124,255', text: '244,246,250' };
  return css
    .slice(start, end)
    .replace(/rgb\(var\(--c-(\w+)-rgb\) \/ ([0-9.]+)\)/g, (_, c: string, a: string) => `rgba(${RGB[c] ?? '136,136,136'},${a})`)
    .replace(/color-mix\(in srgb, var\(--c-surface\) (\d+)%, transparent\)/g, (_, p: string) => `rgba(26,40,72,${Number(p) / 100})`)
    .replace(/var\((--[\w-]+)\)/g, (_, v: string) => COLORS[v] ?? '#888')
    .replace(/\.hv-packet\s*\{[^}]*\}/, '.hv-packet{opacity:0}');
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/**
 * The brand mark (lowercase initials + cursor block) on a dark rounded square, for
 * favicons and app icons. Uses the site's typeface where installed; the PNG/ICO files are
 * rendered with it, and the SVG favicon falls back to a bold system sans.
 */
const markSvg = (text: string, cursor: string) =>
  `<text x="3" y="27" font-family="Inter Display, Inter, Arial, Helvetica, sans-serif" font-weight="700" font-size="21" letter-spacing="-1" fill="${text}">${esc(initials().toLowerCase())}</text>
<rect x="29" y="12" width="7" height="16" rx="1" fill="${cursor}"/>`;

function iconSvg(size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="${size}" height="${size}">
<rect width="40" height="40" rx="9" fill="#101a33"/>
${markSvg('#f4f6fa', '#5b8cff')}
</svg>`;
}

/** Pack PNG images into a .ico file (PNG-in-ICO, supported by every current browser). */
function ico(images: [number, Buffer][]): Buffer {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(([size, data], i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e); // width
    header.writeUInt8(size >= 256 ? 0 : size, e + 1); // height
    header.writeUInt8(0, e + 2); // palette
    header.writeUInt8(0, e + 3); // reserved
    header.writeUInt16LE(1, e + 4); // colour planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map(([, d]) => d)]);
}

async function main(): Promise<void> {
  // Favicons
  writeFileSync(join(pub, 'favicon.svg'), iconSvg(40));
  const png = (size: number) => sharp(Buffer.from(iconSvg(size)), { density: 300 }).resize(size, size).png().toBuffer();
  // favicon.ico: browsers and crawlers request it automatically, even when it isn't linked.
  writeFileSync(join(pub, 'favicon.ico'), ico([[16, await png(16)], [32, await png(32)], [48, await png(48)]]));
  writeFileSync(join(pub, 'apple-touch-icon.png'), await png(180));
  writeFileSync(join(pub, 'icon-192.png'), await png(192));
  writeFileSync(join(pub, 'icon-512.png'), await png(512));

  writeFileSync(
    join(pub, 'site.webmanifest'),
    JSON.stringify(
      {
        name: site.name,
        short_name: displayName(),
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        theme_color: '#101a33',
        background_color: '#101a33',
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
<rect width="1200" height="630" fill="#101a33"/>
${grid}
<g transform="translate(70 62)">${markSvg('#f4f6fa', '#5b8cff')}</g>
<text x="128" y="92" font-family="Inter Display" font-weight="600" font-size="26" fill="#f4f6fa">${esc(site.name)}</text>
${lines}
<text x="72" y="560" font-family="Inter" font-size="24" fill="#9aa5b5">${esc(site.role)}</text>
<rect x="72" y="582" width="28" height="3" fill="#5b8cff"/><rect x="108" y="582" width="28" height="3" fill="#42d9f5"/><rect x="144" y="582" width="28" height="3" fill="#8b7cff"/>
${hero}
</svg>`;
  await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(join(pub, 'og-image.png'));
  console.log('Wrote favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, site.webmanifest, og-image.png');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
