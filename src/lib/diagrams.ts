import { h, r, type SvgNode } from './svg';
import type { Architecture, DataModel } from '../content/types';

/**
 * Case-study diagrams generated from project data, so a new project only needs
 * nodes, edges and tables — no drawing.
 */

const NODE_W = 250;
const NODE_H = 66;
const ROW = 118;
const WIDTH = 760;

interface Box {
  x: number;
  y: number;
}

export function architectureDiagram(arch: Architecture, idPrefix: string): SvgNode {
  const tiers = [...new Set(arch.nodes.map((n) => n.tier))].sort((a, b) => a - b);
  const pos = new Map<string, Box>();
  tiers.forEach((tier, row) => {
    const inTier = arch.nodes.filter((n) => n.tier === tier);
    const gap = 40;
    const total = inTier.length * NODE_W + (inTier.length - 1) * gap;
    const start = (WIDTH - total) / 2;
    inTier.forEach((n, i) => pos.set(n.id, { x: start + i * (NODE_W + gap), y: 20 + row * ROW }));
  });
  const height = 20 + tiers.length * ROW - (ROW - NODE_H) + 20;
  const marker = `${idPrefix}-arrow`;

  const edges = arch.edges.map((e) => {
    const a = pos.get(e.from)!;
    const b = pos.get(e.to)!;
    let d: string;
    let lx: number;
    let ly: number;
    if (Math.abs(a.y - b.y) < 1) {
      // Same tier: connect side to side.
      const leftToRight = a.x < b.x;
      const x1 = leftToRight ? a.x + NODE_W : a.x;
      const x2 = leftToRight ? b.x : b.x + NODE_W;
      const y = a.y + NODE_H / 2;
      d = `M ${r(x1)} ${y} H ${r(x2 + (leftToRight ? -6 : 6))}`;
      lx = (x1 + x2) / 2;
      ly = y - 8;
    } else {
      const x1 = a.x + NODE_W / 2;
      const y1 = a.y + NODE_H;
      const x2 = b.x + NODE_W / 2;
      const y2 = b.y - 6;
      const my = (y1 + y2) / 2;
      d = Math.abs(x1 - x2) < 1 ? `M ${r(x1)} ${y1} V ${y2}` : `M ${r(x1)} ${y1} V ${r(my)} H ${r(x2)} V ${y2}`;
      lx = x2 + 10;
      ly = my + (Math.abs(x1 - x2) < 1 ? 4 : 16);
    }
    return h(
      'g',
      { class: 'dg-edge' },
      h('path', { d, 'marker-end': `url(#${marker})` }),
      e.label ? h('text', { x: r(lx), y: r(ly), class: 'dg-edge-label' }, e.label) : null,
    );
  });

  const nodes = arch.nodes.map((n) => {
    const p = pos.get(n.id)!;
    return h(
      'g',
      { class: `dg-node dg-node--${n.domain ?? 'product'}` },
      h('rect', { x: r(p.x), y: p.y, width: NODE_W, height: NODE_H, rx: 8 }),
      h('rect', { x: r(p.x), y: p.y + 14, width: 3, height: NODE_H - 28, class: 'dg-tick' }),
      h('text', { x: r(p.x + 18), y: p.y + 28, class: 'dg-title' }, n.label),
      n.detail ? h('text', { x: r(p.x + 18), y: p.y + 48, class: 'dg-detail' }, n.detail) : null,
    );
  });

  return h(
    'svg',
    { viewBox: `0 0 ${WIDTH} ${height}`, class: 'diagram', role: 'img', 'aria-label': arch.caption },
    h(
      'defs',
      {},
      h(
        'marker',
        { id: marker, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
        h('path', { d: 'M 0 0 L 10 5 L 0 10 z', class: 'dg-arrow' }),
      ),
    ),
    ...edges,
    ...nodes,
  );
}

const T_W = 200;
const T_ROW = 22;
const T_HEAD = 34;
const COLS = 3;

export function dataModelDiagram(model: DataModel): SvgNode {
  const colGap = (WIDTH - COLS * T_W) / (COLS - 1);
  const boxes = new Map<string, { x: number; y: number; h: number }>();
  const colHeights = Array(COLS).fill(10);
  model.tables.forEach((t, i) => {
    const col = i % COLS;
    const hh = T_HEAD + t.fields.length * T_ROW + 10;
    boxes.set(t.name, { x: col * (T_W + colGap), y: colHeights[col], h: hh });
    colHeights[col] += hh + 44;
  });
  const height = Math.max(...colHeights) - 34;

  const relations = model.relations.map(([a, b], idx) => {
    const p = boxes.get(a)!;
    const q = boxes.get(b)!;
    let d: string;
    if (Math.abs(p.x - q.x) < 1) {
      const x = p.x + T_W / 2;
      d = `M ${r(x)} ${r(p.y + p.h)} V ${r(q.y)}`;
    } else {
      const leftToRight = p.x < q.x;
      const x1 = leftToRight ? p.x + T_W : p.x;
      const x2 = leftToRight ? q.x : q.x + T_W;
      const y1 = p.y + 17;
      const y2 = q.y + 17;
      // Nudge each connector so ones sharing a gutter don't sit on top of each other.
      const mx = (x1 + x2) / 2 + ((idx % 3) - 1) * 10;
      d = `M ${r(x1)} ${r(y1)} H ${r(mx)} V ${r(y2)} H ${r(x2)}`;
    }
    return h('path', { d, class: 'dg-relation' });
  });

  const tables = model.tables.map((t) => {
    const b = boxes.get(t.name)!;
    return h(
      'g',
      { class: 'dg-table' },
      h('rect', { x: r(b.x), y: r(b.y), width: T_W, height: b.h, rx: 8 }),
      h('line', { x1: r(b.x), y1: r(b.y + T_HEAD), x2: r(b.x + T_W), y2: r(b.y + T_HEAD), class: 'dg-table-rule' }),
      h('text', { x: r(b.x + 14), y: r(b.y + 22), class: 'dg-title' }, t.name),
      ...t.fields.map((f, i) => {
        const key = f.startsWith('PK ') ? 'pk' : f.startsWith('FK ') ? 'fk' : '';
        const name = key ? f.slice(3) : f;
        const y = b.y + T_HEAD + 20 + i * T_ROW;
        return h(
          'g',
          {},
          key ? h('text', { x: r(b.x + 14), y: r(y), class: `dg-key dg-key--${key}` }, key.toUpperCase()) : null,
          h('text', { x: r(b.x + 44), y: r(y), class: 'dg-field' }, name),
        );
      }),
    );
  });

  return h('svg', { viewBox: `0 0 ${WIDTH} ${r(height)}`, class: 'diagram', role: 'img', 'aria-label': model.caption }, ...relations, ...tables);
}
