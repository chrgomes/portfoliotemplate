import { h, pts, r, type Pt, type SvgNode } from './svg';
import type { Domain, PreviewKind } from '../content/types';
import { LOGO_HEIGHT, LOGO_PATH, LOGO_WIDTH } from './logo';

/* ==================================================================================
 * Hero: three isometric planes — interface, services, data — with requests flowing
 * between them and an access-control boundary running alongside every layer.
 * Colour encodes domain: blue = product/interface, cyan = data, violet = security.
 * ================================================================================ */

const CX = 290;
const A = 190; // half width of a plane
const B = 95; // half height (2:1 isometric)
const LEVELS = [140, 290, 440];

/** Map (u, v) in the unit square onto the plane centred at y = cy. */
const iso = (cy: number, u: number, v: number): Pt => [CX + u * A - v * A, cy - B + u * B + v * B];

const rhombus = (cy: number, u0 = 0, v0 = 0, u1 = 1, v1 = 1): string =>
  pts([iso(cy, u0, v0), iso(cy, u1, v0), iso(cy, u1, v1), iso(cy, u0, v1)]);

const line = (p: Pt, q: Pt, cls: string, extra: SvgNode['a'] = {}): SvgNode =>
  h('line', { x1: r(p[0]), y1: r(p[1]), x2: r(q[0]), y2: r(q[1]), class: cls, ...extra });

function planeGrid(cy: number): SvgNode[] {
  const out: SvgNode[] = [];
  for (let i = 1; i < 4; i++) {
    const k = i / 4;
    out.push(line(iso(cy, k, 0), iso(cy, k, 1), 'hv-grid'));
    out.push(line(iso(cy, 0, k), iso(cy, 1, k), 'hv-grid'));
  }
  return out;
}

/** Points that are linked vertically between planes, in (u, v). */
const LINKS: Pt[] = [
  [0.3, 0.3],
  [0.7, 0.45],
  [0.45, 0.75],
];

function interfacePlane(cy: number): SvgNode[] {
  return [
    h('polygon', { points: rhombus(cy, 0.12, 0.12, 0.48, 0.48), class: 'hv-tile hv-tile--product' }),
    h('polygon', { points: rhombus(cy, 0.56, 0.12, 0.88, 0.32), class: 'hv-tile' }),
    h('polygon', { points: rhombus(cy, 0.56, 0.38, 0.88, 0.88), class: 'hv-tile' }),
    h('polygon', { points: rhombus(cy, 0.12, 0.56, 0.48, 0.88), class: 'hv-tile' }),
  ];
}

function servicesPlane(cy: number): SvgNode[] {
  const nodes: Pt[] = [[0.3, 0.3], [0.7, 0.45], [0.45, 0.75], [0.78, 0.82], [0.18, 0.62]];
  const edges: [number, number][] = [[0, 1], [1, 2], [0, 4], [4, 2], [1, 3], [2, 3]];
  return [
    ...edges.map(([a, b]) => line(iso(cy, ...nodes[a]), iso(cy, ...nodes[b]), 'hv-edge')),
    ...nodes.map(([u, v], i) => {
      const [x, y] = iso(cy, u, v);
      return h('circle', { cx: r(x), cy: r(y), r: i < 3 ? 5 : 3.5, class: i < 3 ? 'hv-node hv-node--product' : 'hv-node' });
    }),
  ];
}

function dataPlane(cy: number): SvgNode[] {
  const rows: SvgNode[] = [];
  for (let i = 0; i < 4; i++) {
    const v0 = 0.12 + i * 0.2;
    rows.push(h('polygon', { points: rhombus(cy, 0.14, v0, 0.86, v0 + 0.12), class: i === 1 ? 'hv-row hv-row--data' : 'hv-row' }));
  }
  return rows;
}

export function heroSystem(): SvgNode {
  const layers = [
    { name: 'Interface', tech: 'Angular', draw: interfacePlane, cls: 'product' },
    { name: 'Services', tech: 'FastAPI', draw: servicesPlane, cls: 'product' },
    { name: 'Data', tech: 'MySQL', draw: dataPlane, cls: 'data' },
  ];

  const planes = layers.map((layer, i) => {
    const cy = LEVELS[i];
    const right = iso(cy, 1, 0);
    return h(
      'g',
      { class: `hv-plane hv-plane--${i}`, 'data-depth': i },
      h('polygon', { points: rhombus(cy), class: `hv-face hv-face--${layer.cls}` }),
      ...planeGrid(cy),
      ...layer.draw(cy),
      line([right[0] + 12, right[1]], [right[0] + 40, right[1]], 'hv-leader'),
      h('text', { x: r(right[0] + 50), y: r(right[1] - 4), class: 'hv-label' }, layer.name),
      h('text', { x: r(right[0] + 50), y: r(right[1] + 15), class: 'hv-label hv-label--tech' }, layer.tech),
    );
  });

  // Vertical request paths between planes, each with a travelling packet.
  const flows: SvgNode[] = [];
  LINKS.forEach(([u, v], i) => {
    for (let lvl = 0; lvl < 2; lvl++) {
      const p = iso(LEVELS[lvl], u, v);
      const q = iso(LEVELS[lvl + 1], u, v);
      const dataHop = lvl === 1;
      flows.push(line(p, q, `hv-link${dataHop ? ' hv-link--data' : ''}`));
      flows.push(
        h('circle', {
          cx: r(p[0]),
          cy: r(p[1]),
          r: 3,
          class: `hv-packet hv-packet--d${(i + lvl * 2) % 5}${dataHop ? ' hv-packet--data' : ''}`,
        }),
      );
    }
  });

  // Access-control boundary: a violet rail with a gate at every layer.
  const railX = CX - A - 34;
  const top = LEVELS[0] - 30;
  const bottom = LEVELS[2] + 30;
  const gates = LEVELS.map((y) =>
    h(
      'g',
      { class: 'hv-gate' },
      line([railX + 6, y], [CX - A - 6, y], 'hv-gate-line'),
      h('polygon', { points: pts([[railX, y - 7], [railX + 7, y], [railX, y + 7], [railX - 7, y]]), class: 'hv-gate-mark' }),
    ),
  );

  return h(
    'svg',
    {
      viewBox: '0 0 640 560',
      class: 'hero-system',
      role: 'img',
      'aria-labelledby': 'hero-system-title',
    },
    h('title', { id: 'hero-system-title' }, 'Diagram of a web application as three layers — interface, services and data — with requests passing between them and access checks at each layer.'),
    h('g', { class: 'hv-flows' }, ...flows),
    ...planes.reverse(),
    h(
      'g',
      { class: 'hv-rail' },
      line([railX, top], [railX, bottom], 'hv-rail-line'),
      ...gates,
      h('text', { x: railX - 12, y: bottom, class: 'hv-label hv-label--security', transform: `rotate(-90 ${railX - 12} ${bottom})` }, 'Access checks'),
    ),
  );
}

/* ==================================================================================
 * Project previews — abstract interface sketches, clearly labelled as concepts.
 * ================================================================================ */

const W = 640;
const H = 400;

const rect = (x: number, y: number, w: number, hh: number, cls: string, rx = 4): SvgNode =>
  h('rect', { x, y, width: w, height: hh, rx, class: cls });
const text = (x: number, y: number, s: string, cls = 'pv-text'): SvgNode => h('text', { x, y, class: cls }, s);
const bar = (x: number, y: number, w: number, cls = 'pv-ink'): SvgNode => rect(x, y, w, 6, cls, 3);

function frame(title: string, ...content: SvgNode[]): SvgNode {
  return h(
    'g',
    {},
    rect(0.5, 0.5, W - 1, H - 1, 'pv-window', 12),
    h('line', { x1: 0, y1: 40, x2: W, y2: 40, class: 'pv-rule' }),
    text(20, 25, title, 'pv-title'),
    rect(W - 92, 13, 72, 16, 'pv-chip', 8),
    ...content,
  );
}

function logistics(): SvgNode {
  const lanes = ['Booked', 'Dispatched', 'In transit', 'Delivered'];
  const counts = [3, 2, 3, 1];
  const laneW = 118;
  const out: SvgNode[] = [rect(16, 56, 92, 328, 'pv-panel', 8)];
  for (let i = 0; i < 5; i++) out.push(bar(30, 76 + i * 26, i === 0 ? 56 : 44 + (i % 2) * 14, i === 0 ? 'pv-ink pv-ink--product' : 'pv-ink'));
  lanes.forEach((name, i) => {
    const x = 124 + i * (laneW + 6);
    out.push(text(x, 70, name, 'pv-label'));
    for (let k = 0; k < counts[i]; k++) {
      const y = 84 + k * 74;
      const hot = i === 2 && k === 0;
      out.push(rect(x, y, laneW - 6, 64, hot ? 'pv-card pv-card--product' : 'pv-card', 6));
      out.push(bar(x + 12, y + 14, 70, hot ? 'pv-ink pv-ink--strong' : 'pv-ink pv-ink--strong'));
      out.push(bar(x + 12, y + 30, 92));
      out.push(rect(x + 12, y + 44, k % 2 ? 34 : 46, 10, hot ? 'pv-tag pv-tag--product' : 'pv-tag', 5));
    }
  });
  return frame('shipments', ...out);
}

function social(): SvgNode {
  const out: SvgNode[] = [];
  const cw = 54;
  const ch = 64;
  const x0 = 20;
  const y0 = 60;
  const posts: Record<string, Domain> = { '1-0': 'product', '3-0': 'data', '0-1': 'security', '4-1': 'product', '2-2': 'data', '5-2': 'product', '1-3': 'product', '6-3': 'data', '3-2': 'security' };
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 7; col++) {
      const x = x0 + col * (cw + 4);
      const y = y0 + row * (ch + 4);
      out.push(rect(x, y, cw, ch, 'pv-cell', 4));
      const d = posts[`${col}-${row}`];
      if (d) out.push(rect(x + 6, y + 26, cw - 12, 14, `pv-tag pv-tag--${d}`, 4));
    }
  }
  const bx = 440;
  out.push(rect(bx, 60, 180, 268, 'pv-panel', 8));
  out.push(text(bx + 16, 84, 'Engagement', 'pv-label'));
  const heights = [60, 92, 70, 128, 104, 150];
  heights.forEach((hh, i) => out.push(rect(bx + 18 + i * 26, 300 - hh, 16, hh, i === 5 ? 'pv-fill pv-fill--data' : 'pv-fill', 3)));
  out.push(rect(20, 342, 400, 40, 'pv-panel', 8), bar(36, 358, 140, 'pv-ink pv-ink--strong'), rect(334, 352, 72, 20, 'pv-button', 10));
  return frame('calendar', ...out);
}

function ai(): SvgNode {
  const out: SvgNode[] = [rect(20, 60, 272, 320, 'pv-panel', 8), text(36, 84, 'Source text', 'pv-label')];
  [220, 236, 180, 228, 200, 120, 236, 210, 160].forEach((w, i) => out.push(bar(36, 102 + i * 20, w)));
  out.push(h('path', { d: 'M 304 220 h 28 m -8 -7 l 8 7 l -8 7', class: 'pv-arrow' }));
  out.push(rect(344, 60, 276, 320, 'pv-panel pv-panel--data', 8), text(360, 84, 'Extracted record', 'pv-label'));
  const fields = ['company', 'contact', 'date', 'amount', 'reference'];
  fields.forEach((f, i) => {
    const y = 112 + i * 40;
    out.push(text(360, y, f, 'pv-mono'));
    out.push(bar(450, y - 8, 100 - (i % 3) * 18, 'pv-ink pv-ink--strong'));
    out.push(h('path', { d: `M ${592} ${y - 7} l 4 4 l 8 -9`, class: i === 3 ? 'pv-check pv-check--warn' : 'pv-check' }));
  });
  out.push(rect(360, 328, 112, 30, 'pv-button pv-button--data', 15), rect(482, 328, 82, 30, 'pv-button', 15));
  return frame('extract', ...out);
}

function security(): SvgNode {
  const out: SvgNode[] = [rect(20, 60, 380, 252, 'pv-panel', 8), text(36, 84, 'Lab events (simulated)', 'pv-label')];
  for (let i = 0; i < 8; i++) {
    const y = 104 + i * 24;
    const flagged = i === 2 || i === 3 || i === 5;
    out.push(rect(36, y - 8, 4, 12, flagged ? 'pv-sev pv-sev--security' : 'pv-sev', 1));
    out.push(bar(50, y - 5, 60, 'pv-ink'));
    out.push(bar(124, y - 5, flagged ? 150 : 110 + (i % 3) * 30, flagged ? 'pv-ink pv-ink--strong' : 'pv-ink'));
  }
  out.push(rect(416, 60, 204, 252, 'pv-panel pv-panel--security', 8), text(432, 84, 'Detection rule', 'pv-label'));
  ['when', '  failed_logins', '  > 5 in 2 min', 'then', '  raise alert'].forEach((s, i) => out.push(text(432, 116 + i * 22, s, 'pv-mono')));
  out.push(rect(20, 326, 600, 56, 'pv-panel', 8));
  [6, 9, 5, 7, 22, 30, 12, 6, 8, 5, 7, 6, 9, 26, 10, 6, 5, 8, 7, 6].forEach((v, i) =>
    out.push(rect(36 + i * 29, 372 - v, 18, v, v > 20 ? 'pv-fill pv-fill--security' : 'pv-fill', 2)),
  );
  return frame('lab', ...out);
}

function automation(): SvgNode {
  const nodes: { x: number; y: number; label: string; d?: Domain }[] = [
    { x: 30, y: 180, label: 'Trigger' },
    { x: 170, y: 180, label: 'Rules' },
    { x: 310, y: 180, label: 'AI classify', d: 'data' },
    { x: 470, y: 100, label: 'Destination', d: 'data' },
    { x: 470, y: 270, label: 'Review', d: 'security' },
  ];
  const nw = 120;
  const nh = 56;
  const edge = (a: number, b: number): SvgNode => {
    const p = nodes[a];
    const q = nodes[b];
    const x1 = p.x + nw;
    const y1 = p.y + nh / 2;
    const x2 = q.x;
    const y2 = q.y + nh / 2;
    const mx = (x1 + x2) / 2;
    return h('path', { d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`, class: 'pv-wire' });
  };
  return frame(
    'workflow',
    ...[edge(0, 1), edge(1, 2), edge(2, 3), edge(2, 4)],
    ...nodes.flatMap((n) => [
      rect(n.x, n.y, nw, nh, n.d ? `pv-node pv-node--${n.d}` : 'pv-node', 10),
      text(n.x + 16, n.y + 33, n.label, 'pv-mono'),
    ]),
    text(30, 372, 'Low-confidence items go to a person', 'pv-label'),
  );
}

function commerce(): SvgNode {
  const out: SvgNode[] = [];
  for (let i = 0; i < 6; i++) {
    const x = 20 + (i % 3) * 136;
    const y = 60 + Math.floor(i / 3) * 162;
    out.push(rect(x, y, 124, 150, 'pv-card', 8), rect(x + 10, y + 10, 104, 84, 'pv-cell', 6));
    out.push(h('circle', { cx: x + 62, cy: y + 52, r: 22, class: i === 1 ? 'pv-fill pv-fill--product' : 'pv-fill' }));
    out.push(bar(x + 12, y + 108, 80, 'pv-ink pv-ink--strong'), bar(x + 12, y + 124, 40));
  }
  out.push(rect(440, 60, 180, 312, 'pv-panel', 8), text(456, 84, 'Order', 'pv-label'));
  for (let i = 0; i < 3; i++) out.push(bar(456, 104 + i * 26, 110), bar(580, 104 + i * 26, 24, 'pv-ink pv-ink--strong'));
  out.push(rect(456, 322, 148, 34, 'pv-button pv-button--product', 17));
  return frame('store', ...out);
}

const PREVIEWS: Record<PreviewKind, () => SvgNode> = { logistics, social, ai, security, automation, commerce };

export function projectPreview(kind: PreviewKind, title: string): SvgNode {
  return h(
    'svg',
    { viewBox: `0 0 ${W} ${H}`, class: 'pv', role: 'img', 'aria-label': `Concept illustration for ${title}. Not a screenshot.` },
    PREVIEWS[kind](),
  );
}

/* ==================================================================================
 * Principle glyphs — 64×64 line drawings.
 * ================================================================================ */

export function glyph(kind: 'understand' | 'design' | 'build' | 'secure'): SvgNode {
  const g: Record<string, SvgNode[]> = {
    understand: [
      h('circle', { cx: 28, cy: 28, r: 17 }),
      h('path', { d: 'M28 4 v12 M28 40 v12 M4 28 h12 M40 28 h12' }),
      h('path', { d: 'M41 41 L58 58' }),
      h('circle', { cx: 28, cy: 28, r: 3, class: 'gl-dot' }),
    ],
    design: [
      h('path', { d: 'M8 8 h48 v48 h-48 z M24 8 v48 M40 8 v48 M8 24 h48 M8 40 h48' }),
      h('path', { d: 'M8 56 L56 8', class: 'gl-accent' }),
    ],
    build: [
      h('path', { d: 'M32 6 L58 19 L32 32 L6 19 Z' }),
      h('path', { d: 'M6 31 L32 44 L58 31' }),
      h('path', { d: 'M6 43 L32 56 L58 43', class: 'gl-accent' }),
    ],
    secure: [
      h('path', { d: 'M32 4 L56 14 V32 C56 46 45 55 32 60 C19 55 8 46 8 32 V14 Z' }),
      h('path', { d: 'M24 30 v-5 a8 8 0 0 1 16 0 v5' }),
      h('rect', { x: 21, y: 30, width: 22, height: 16, rx: 3, class: 'gl-accent' }),
    ],
  };
  return h('svg', { viewBox: '0 0 64 64', class: `glyph glyph--${kind}`, 'aria-hidden': 'true', focusable: 'false' }, ...g[kind]);
}

/* ==================================================================================
 * Brand mark — the CG logo (see logo.ts). `size` is its height in pixels.
 * ================================================================================ */

export function monogram(_chars: string, size = 32): SvgNode {
  return h(
    'svg',
    {
      viewBox: `0 0 ${LOGO_WIDTH} ${LOGO_HEIGHT}`,
      width: Math.round((size * LOGO_WIDTH) / LOGO_HEIGHT),
      height: size,
      class: 'monogram',
      'aria-hidden': 'true',
      focusable: 'false',
    },
    h('path', { d: LOGO_PATH, class: 'mg-logo' }),
  );
}
