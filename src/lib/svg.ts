/**
 * A tiny, framework-free description of SVG markup.
 *
 * Visuals are generated as plain data so the same drawing code serves both builds:
 * the static builder serialises it to a string, and Angular renders it node by node
 * with Renderer2 (no innerHTML, no sanitiser bypass).
 */
export interface SvgNode {
  t: string;
  a?: Record<string, string | number | undefined>;
  c?: (SvgNode | string)[];
}

export const h = (t: string, a: SvgNode['a'] = {}, ...c: (SvgNode | string | null | false | undefined)[]): SvgNode => ({
  t,
  a,
  c: c.filter((x): x is SvgNode | string => x !== null && x !== false && x !== undefined),
});

export type Pt = [number, number];

export const pts = (list: Pt[]): string => list.map(([x, y]) => `${r(x)},${r(y)}`).join(' ');

/** Round to one decimal place to keep markup small. */
export const r = (n: number): number => Math.round(n * 10) / 10;

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Serialise to an SVG string (static builder, OG image). */
export function toSvgString(node: SvgNode | string): string {
  if (typeof node === 'string') return esc(node);
  const attrs = Object.entries(node.a ?? {})
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => ` ${k}="${esc(String(v))}"`)
    .join('');
  const kids = (node.c ?? []).map(toSvgString).join('');
  return kids ? `<${node.t}${attrs}>${kids}</${node.t}>` : `<${node.t}${attrs}/>`;
}
