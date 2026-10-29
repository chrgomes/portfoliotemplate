import { h, type SvgNode } from './svg';

/**
 * A handful of Lucide icons (ISC licence, https://lucide.dev), inlined so the site
 * ships no icon library. Add more by copying the element list from lucide.dev.
 */
const ICONS = {
  'arrow-down': [h('path', { d: 'M12 5v14' }), h('path', { d: 'm19 12-7 7-7-7' })],
  'arrow-up': [h('path', { d: 'm5 12 7-7 7 7' }), h('path', { d: 'M12 19V5' })],
  'arrow-left': [h('path', { d: 'm12 19-7-7 7-7' }), h('path', { d: 'M19 12H5' })],
  'arrow-right': [h('path', { d: 'M5 12h14' }), h('path', { d: 'm12 5 7 7-7 7' })],
  'arrow-up-right': [h('path', { d: 'M7 7h10v10' }), h('path', { d: 'M7 17 17 7' })],
  mail: [h('rect', { width: 20, height: 16, x: 2, y: 4, rx: 2 }), h('path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' })],
  github: [
    h('path', {
      d: 'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4',
    }),
    h('path', { d: 'M9 18c-4.51 2-5-2-7-2' }),
  ],
  linkedin: [
    h('path', { d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' }),
    h('rect', { width: 4, height: 12, x: 2, y: 9 }),
    h('circle', { cx: 4, cy: 4, r: 2 }),
  ],
  'file-text': [
    h('path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }),
    h('path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }),
    h('path', { d: 'M10 9H8' }),
    h('path', { d: 'M16 13H8' }),
    h('path', { d: 'M16 17H8' }),
  ],
  copy: [
    h('rect', { width: 14, height: 14, x: 8, y: 8, rx: 2, ry: 2 }),
    h('path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }),
  ],
  check: [h('path', { d: 'M20 6 9 17l-5-5' })],
  sun: [
    h('circle', { cx: 12, cy: 12, r: 4 }),
    h('path', { d: 'M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' }),
  ],
  moon: [h('path', { d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' })],
  send: [
    h('path', { d: 'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z' }),
    h('path', { d: 'm21.854 2.147-10.94 10.939' }),
  ],
} satisfies Record<string, SvgNode[]>;

export type IconName = keyof typeof ICONS;

export const icon = (name: IconName): SvgNode =>
  h('svg', { viewBox: '0 0 24 24', class: `icon icon--${name}`, 'aria-hidden': 'true', focusable: 'false' }, ...ICONS[name]);
