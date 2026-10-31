/**
 * HTML templates for the zero-dependency static build.
 * The Angular components in src/app render the same markup and class names.
 */
import { site, copy, principles, processSteps } from '../../src/content/site.config';
import { featuredProjects, statusLabel } from '../../src/content/projects';
import { skillGroups } from '../../src/content/expertise';
import { about } from '../../src/content/about';
import type { Project, Credential } from '../../src/content/types';
import { caseStudySections, type CaseSection } from '../../src/lib/case-study';
import { privacySections, privacyUpdated } from '../../src/content/privacy';
import { toSvgString, type SvgNode } from '../../src/lib/svg';
import { heroSystem, brokenSystem, projectPreview, glyph, monogram, processGlyph } from '../../src/lib/visuals';
import { architectureDiagram, dataModelDiagram } from '../../src/lib/diagrams';
import { icon, type IconName } from '../../src/lib/icons';
import {
  displayName,
  initials,
  projectsUsing,
  projectPath,
  absoluteUrl,
  nextProject,
  type PageMeta,
} from '../../src/lib/helpers';

export interface RenderOptions {
  /** Prefix for internal links: "/" in production, a relative path in the preview build. */
  root: string;
  preview: boolean;
  css: string;
  js: string;
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const svg = (n: SvgNode): string => toSvgString(n);
const ic = (n: IconName): string => svg(icon(n));
const link = (o: RenderOptions, path: string): string => {
  let [base, hash] = path.replace(/^\//, '').split('#');
  // Static hosts without directory indexes (the preview) need explicit index.html.
  if (o.preview && base.endsWith('/')) base += 'index.html';
  return o.root + base + (hash !== undefined ? '#' + hash : '');
};

const DOMAIN_LABEL = { product: 'Interface and product', data: 'Data and AI', security: 'Security' } as const;

/* ---------------------------------------------------------------------------- */

export function layout(o: RenderOptions, meta: PageMeta, body: string, bodyClass = ''): string {
  const canonical = absoluteUrl(meta.path);
  const og = absoluteUrl('/og-image.png');
  const jsonLd = meta.jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<link rel="canonical" href="${esc(canonical)}">
${o.preview || meta.noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="${meta.type}">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.name)} — ${esc(site.role)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#101a33">
<link rel="icon" href="${link(o, '/favicon.ico')}" sizes="32x32">
<link rel="icon" href="${link(o, '/favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${link(o, '/apple-touch-icon.png')}">
<link rel="manifest" href="${link(o, '/site.webmanifest')}">
<link rel="preload" href="${link(o, '/fonts/InterDisplay-SemiBold.woff')}" as="font" type="font/woff" crossorigin>
<link rel="preload" href="${link(o, '/fonts/Inter-Regular.woff')}" as="font" type="font/woff" crossorigin>
<script src="${link(o, '/theme.js')}"></script>
<link rel="stylesheet" href="${link(o, '/assets/' + o.css)}">
<script src="${link(o, '/assets/' + o.js)}" defer></script>
${jsonLd}
</head>
<body class="${bodyClass}">
<a class="skip-link" href="#main">Skip to content</a>
<div class="page-grid" aria-hidden="true"><div class="container"></div></div>
${nav(o)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(o)}
<div class="cursor-ring" aria-hidden="true"></div>
</body>
</html>
`;
}

/* ---------------------------------------------------------------------------- */

const NAV = [
  { href: '/#top', label: 'Home', id: 'top' },
  { href: '/#work', label: 'Work', id: 'work' },
  { href: '/#expertise', label: 'Expertise', id: 'expertise' },
  { href: '/#about', label: 'About', id: 'about' },
  { href: '/#contact', label: 'Contact', id: 'contact' },
];

function nav(o: RenderOptions): string {
  const items = NAV.map((n) => `<li><a href="${link(o, n.href)}" data-spy="${n.id}">${n.label}</a></li>`).join('');
  const sheet = NAV.map(
    (n, i) => `<li><a href="${link(o, n.href)}">${n.label}<span class="mono">${String(i + 1).padStart(2, '0')}</span></a></li>`,
  ).join('');
  return `<header class="site-nav" id="site-nav">
  <div class="container">
    <a class="brand" href="${link(o, '/')}" aria-label="${esc(displayName())}, home">${svg(monogram(initials()))}<span>${esc(displayName())}</span></a>
    <nav aria-label="Primary"><ul class="nav-links">${items}</ul></nav>
    <div class="nav-actions">
      <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch to light mode">${ic('sun')}${ic('moon')}</button>
      <a class="btn btn--primary nav-cta" href="${link(o, '/#contact')}">Let’s talk</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-sheet" aria-label="Open menu"><span></span><span></span></button>
    </div>
  </div>
  <div class="nav-sheet" id="nav-sheet" hidden>
    <nav aria-label="Mobile"><ul>${sheet}</ul></nav>
    <a class="btn btn--primary" href="${link(o, '/#contact')}">Let’s talk</a>
  </div>
</header>`;
}

function footer(o: RenderOptions): string {
  const c = site.contact;
  const links = [
    c.github ? `<li><a href="${esc(c.github)}" rel="me noopener" target="_blank">${ic('github')}GitHub</a></li>` : '',
    c.linkedin ? `<li><a href="${esc(c.linkedin)}" rel="me noopener" target="_blank">${ic('linkedin')}LinkedIn</a></li>` : '',
    c.email ? `<li><a href="mailto:${esc(c.email)}">${ic('mail')}Email</a></li>` : '',
    `<li><a href="${link(o, '/privacy/')}">Privacy</a></li>`,
  ].join('');
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-left">${svg(monogram(initials(), 28))}<span>© <span data-year>${year}</span> ${esc(site.name)}</span></div>
    ${links ? `<ul class="footer-links">${links}</ul>` : ''}
    <a class="to-top" href="#top">Back to top ${ic('arrow-up')}</a>
  </div>
</footer>`;
}

/* ---------------------------------------------------------------------------- */

export function home(o: RenderOptions): string {
  return [hero(o), work(o), expertise(o), principlesSection(), aboutSection(), processSection(), contact(o)].join('\n');
}

function hero(o: RenderOptions): string {
  // Spaces between the lines, so the heading reads as one sentence to search engines and
  // screen readers ("Engineering the next layer", not "Engineeringthe next layer").
  const lines = copy.heroLines.map((l) => `<span class="line">${esc(l)}</span>`).join(' ');
  const clock = site.timeZone
    ? `<p class="mono clock" data-clock="${esc(site.timeZone)}">Local time, ${esc(site.timeZoneLabel)}: <time>--:--</time></p>`
    : '';
  return `<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="container">
    <div class="hero-grid">
      <h1 class="hero-title" id="hero-title">${lines}</h1>
      <div class="hero-copy">
        ${site.availability ? `<p class="availability">${esc(site.availability)}</p>` : ''}
        <p class="hero-lead">${esc(copy.heroLead)}</p>
        <div class="hero-actions">
          <a class="btn btn--primary" href="#work">Explore my work ${ic('arrow-down')}</a>
          <a class="btn" href="#contact">Let’s connect</a>
        </div>
      </div>
      <div class="hero-visual" data-parallax>${svg(heroSystem())}</div>
    </div>
    <div class="hero-foot mono">
      <ul class="legend" aria-label="Colour key">
        <li data-domain="product">${DOMAIN_LABEL.product}</li>
        <li data-domain="data">${DOMAIN_LABEL.data}</li>
        <li data-domain="security">${DOMAIN_LABEL.security}</li>
      </ul>
      ${clock}
    </div>
  </div>
</section>`;
}

const CARD_WIDTHS = ['w7', 'w5', 'w5', 'w7', 'w12', 'w12'];

function projectCard(o: RenderOptions, p: Project, i: number): string {
  const href = link(o, projectPath(p));
  const media = p.image
    ? `<img src="${link(o, p.image.src)}" alt="${esc(p.image.alt)}" width="${p.image.width}" height="${p.image.height}" loading="lazy" decoding="async">`
    : `${svg(projectPreview(p.preview, p.title))}<span class="media-label mono">Concept visual, not a screenshot</span>`;
  const ext = [
    p.repoUrl ? `<a class="text-link ext" href="${esc(p.repoUrl)}" target="_blank" rel="noopener">${ic('github')}Source</a>` : '',
    p.liveUrl ? `<a class="text-link ext" href="${esc(p.liveUrl)}" target="_blank" rel="noopener">Live demo ${ic('arrow-up-right')}</a>` : '',
  ].join('');
  return `<article class="card card--${CARD_WIDTHS[i] ?? 'w12'} reveal" data-domain="${p.domain}" data-cursor="Read">
  <div class="card-media">${media}</div>
  <div class="card-body">
    <div class="card-meta"><span class="mono">${esc(p.category)}</span><span class="status status--${p.status}">${statusLabel[p.status]}</span></div>
    <h3><a class="card-link" href="${href}">${esc(p.title)}</a></h3>
    <p>${esc(p.summary)}</p>
    <ul class="tags" aria-label="Technology">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    <div class="card-actions">
      <span class="text-link" aria-hidden="true">Read the case study</span>
      ${ext || '<span class="note mono">No public repo or demo yet</span>'}
    </div>
  </div>
</article>`;
}

function work(o: RenderOptions): string {
  return `<section class="section" id="work" aria-labelledby="work-title">
  <div class="container">
    <div class="section-head reveal">
      <h2 id="work-title">${esc(copy.workTitle)}</h2>
      <p>${esc(copy.workLead)}</p>
    </div>
    <div class="work-grid">
      ${featuredProjects().map((p, i) => projectCard(o, p, i)).join('\n')}
    </div>
  </div>
</section>`;
}

function expertise(o: RenderOptions): string {
  const tabs = skillGroups
    .map(
      (g, i) => `<li role="presentation"><button class="skill-tab" role="tab" id="tab-${g.id}" aria-controls="panel-${g.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-domain="${g.domain}">${esc(g.title)}<span class="mono">${g.items.length}</span></button></li>`,
    )
    .join('');
  const panels = skillGroups
    .map((g) => {
      const first = g.items.find((s) => s.note) ?? g.items[0];
      const items = g.items
        .map((s) => {
          const used = projectsUsing(s.name).map((p) => ({ title: p.title, href: link(o, projectPath(p)) }));
          return `<li><button class="skill" type="button" aria-pressed="${s === first}" data-note="${esc(s.note ?? '')}" data-used='${esc(JSON.stringify(used))}'>${esc(s.name)}</button></li>`;
        })
        .join('');
      return `<div class="skill-panel" role="tabpanel" id="panel-${g.id}" aria-labelledby="tab-${g.id}" data-domain="${g.domain}">
  <h3>${esc(g.title)}</h3>
  <p>${esc(g.summary)}</p>
  <ul class="skill-items" aria-label="${esc(g.title)} skills">${items}</ul>
  <div class="skill-detail" aria-live="polite">${skillDetail(o, first.name, first.note)}</div>
</div>`;
    })
    .join('\n');
  return `<section class="section" id="expertise" aria-labelledby="expertise-title">
  <div class="container">
    <div class="section-head reveal">
      <h2 id="expertise-title">${esc(copy.expertiseTitle)}</h2>
      <p>${esc(copy.expertiseLead)}</p>
    </div>
    <div class="skills" data-skills>
      <ul class="skill-tabs" role="tablist" aria-label="Skill areas">${tabs}</ul>
      <div class="skill-panels">${panels}</div>
    </div>
  </div>
</section>`;
}

export function skillDetail(o: RenderOptions, name: string, note?: string): string {
  const used = projectsUsing(name);
  const usedHtml = used.length
    ? `<p class="used mono">Used in ${used.map((p) => `<a href="${link(o, projectPath(p))}">${esc(p.title)}</a>`).join(', ')}</p>`
    : '';
  return `<strong>${esc(name)}</strong>${note ? `<p>${esc(note)}</p>` : ''}${usedHtml}`;
}

function principlesSection(): string {
  const items = principles
    .map(
      (p, i) => `<li class="principle reveal">
  <div class="principle-head">${svg(glyph(p.glyph))}<span class="mono">${String(i + 1).padStart(2, '0')}</span></div>
  <h3>${esc(p.title)}</h3>
  <p>${esc(p.body)}</p>
</li>`,
    )
    .join('');
  return `<section class="section section--paper" id="approach" aria-labelledby="approach-title">
  <div class="container">
    <div class="section-head reveal"><h2 id="approach-title">${esc(copy.philosophyTitle)}</h2></div>
    <ol class="principles">${items}</ol>
  </div>
</section>`;
}

const credential = (c: Credential): string => {
  const sub = [c.institution, c.year].filter(Boolean).join(', ');
  return `<li>${esc(c.title)}${sub ? `<span class="sub">${esc(sub)}</span>` : ''}${c.note ? `<span class="sub">${esc(c.note)}</span>` : ''}</li>`;
};

function aboutSection(): string {
  const [lede, ...rest] = about.intro;
  const block = (title: string, items: string[]): string =>
    items.length ? `<div><dt>${title}</dt><dd><ul>${items.join('')}</ul></dd></div>` : '';
  return `<section class="section" id="about" aria-labelledby="about-title">
  <div class="container about">
    <div class="about-copy reveal">
      <h2 id="about-title">${esc(copy.aboutTitle)}</h2>
      <p class="lede">${esc(lede)}</p>
      <div class="prose">${rest.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    </div>
    <dl class="dossier reveal">
      ${block('Education', about.education.map(credential))}
      ${block('Certifications', about.certifications.map(credential))}
      ${block('Experience', about.background.map((b) => `<li>${esc(b)}</li>`))}
      ${block('Currently learning', about.learning.map((b) => `<li>${esc(b)}</li>`))}
      ${block('Interests', about.interests.map((b) => `<li>${esc(b)}</li>`))}
    </dl>
  </div>
</section>`;
}

function processSection(): string {
  const steps = processSteps
    .map(
      (s, i) => `<li class="step${i === 0 ? ' is-active' : ''}">
  <button class="step-btn" type="button" aria-pressed="${i === 0}" data-step="${i}"><span class="step-num">${String(i + 1).padStart(2, '0')}</span><h3>${svg(processGlyph(s.glyph))}${esc(s.title)}</h3></button>
  <p>${esc(s.body)}</p>
  <p class="output mono">Produces: ${esc(s.output)}</p>
</li>`,
    )
    .join('');
  return `<section class="section" id="process" aria-labelledby="process-title">
  <div class="container">
    <div class="section-head reveal"><h2 id="process-title">${esc(copy.processTitle)}</h2></div>
    <div class="process-wrap">
      <ol class="process" data-process>${steps}</ol>
      <span class="process-dot" aria-hidden="true"></span>
    </div>
  </div>
</section>`;
}

function contact(o: RenderOptions): string {
  const c = site.contact;
  const missing = (what: string, key: string): string =>
    o.preview ? `<span class="config-note">Add your ${what} in site.config.ts (${key})</span>` : '';
  const actions = [
    c.email
      ? `<a class="btn btn--primary" href="mailto:${esc(c.email)}">${ic('mail')}${esc(c.email)}</a>
         <button class="btn copy-btn" type="button" data-copy="${esc(c.email)}" aria-label="Copy email address">${ic('copy')}</button>
         <span class="copy-feedback mono" role="status"></span>`
      : missing('email', 'contact.email'),
    c.github ? `<a class="btn" href="${esc(c.github)}" target="_blank" rel="me noopener">${ic('github')}GitHub</a>` : missing('GitHub URL', 'contact.github'),
    c.linkedin ? `<a class="btn" href="${esc(c.linkedin)}" target="_blank" rel="me noopener">${ic('linkedin')}LinkedIn</a>` : missing('LinkedIn URL', 'contact.linkedin'),
    c.resume ? `<a class="btn" href="${link(o, c.resume)}" download>${ic('file-text')}Résumé (PDF)</a>` : '',
  ].join('\n');

  const form = c.formEndpoint
    ? `<form class="contact-form reveal" action="${esc(c.formEndpoint.startsWith('/') ? link(o, c.formEndpoint) : c.formEndpoint)}" method="post" novalidate data-contact-form${o.preview ? ' data-preview' : ''}${!o.preview && c.challengeEndpoint ? ` data-challenge="${esc(c.challengeEndpoint.startsWith('/') ? link(o, c.challengeEndpoint) : c.challengeEndpoint)}"` : ''}>
  <h3>Send a message</h3>
  <div class="field">
    <label for="cf-name">Name</label>
    <input id="cf-name" name="name" type="text" autocomplete="name" required maxlength="100" aria-describedby="cf-name-err">
    <span class="field-error" id="cf-name-err"></span>
  </div>
  <div class="field">
    <label for="cf-email">Email</label>
    <input id="cf-email" name="email" type="email" autocomplete="email" required maxlength="200" aria-describedby="cf-email-err">
    <span class="field-error" id="cf-email-err"></span>
  </div>
  <div class="field">
    <label for="cf-message">Message</label>
    <textarea id="cf-message" name="message" required minlength="10" maxlength="5000" aria-describedby="cf-message-err"></textarea>
    <span class="field-error" id="cf-message-err"></span>
  </div>
  <div class="hp" aria-hidden="true"><label for="cf-website">Leave this empty</label><input id="cf-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
  <input type="hidden" name="started" value="">
  <input type="hidden" name="altcha" value="">
  <button class="btn btn--primary" type="submit"${o.preview ? ' disabled' : ''}>${ic('send')}<span>Send message</span></button>
  <p class="form-status" role="status" aria-live="polite"></p>
  <p class="form-note form-note--warn form-note--nojs">This form needs JavaScript for its spam check.${c.email ? ` You can email me at ${esc(c.email)} instead.` : ' Turn JavaScript on to send a message.'}</p>
  <p class="form-note">${o.preview ? 'Preview only: the form sends through contact.php once the site is on your GoDaddy hosting.' : 'Your details are used only to reply to you. Spam protection runs in your browser, with no tracking.'}</p>
</form>`
    : '';

  return `<section class="section contact" id="contact" aria-labelledby="contact-title">
  <div class="container contact-grid">
    <div class="contact-copy reveal">
      <h2 id="contact-title">${esc(copy.contactTitle)}</h2>
      <p>${esc(copy.contactLead)}</p>
      <div class="contact-actions">${actions}</div>
    </div>
    ${form}
  </div>
</section>`;
}

/* ---------------------------------------------------------------------------- */

const list = (items: string[]): string => `<ul class="cs-list">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

function sectionHtml(s: CaseSection, p: Project): string {
  switch (s.kind) {
    case 'lede':
      return `<p class="cs-lede">${esc(s.text)}</p>`;
    case 'text':
      return `<p>${esc(s.text)}</p>`;
    case 'list':
      return list(s.items);
    case 'tags':
      return `<ul class="tags">${s.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
    case 'status':
      return `<p><span class="status status--${s.status}">${statusLabel[s.status]}</span></p><p>${esc(s.text)}</p>`;
    case 'decisions':
      return `<div class="cs-decisions">${s.decisions.map((d) => `<div><h3>${esc(d.title)}</h3><p>${esc(d.body)}</p></div>`).join('')}</div>`;
    case 'architecture': {
      const a = s.architecture;
      const label = (id: string): string => esc(a.nodes.find((n) => n.id === id)?.label ?? id);
      return `<figure class="cs-figure">
  <p class="scroll-hint mono" aria-hidden="true">Swipe sideways to see the whole diagram</p>
  <div class="diagram-scroll" tabindex="0" role="region" aria-label="Architecture diagram, scrolls sideways on small screens">${svg(architectureDiagram(a, p.slug))}</div>
  <figcaption>${esc(a.caption)}</figcaption>
</figure>
<details class="cs-alt"><summary>Read the diagram as text</summary>
<dl>${a.nodes.map((n) => `<div><dt>${esc(n.label)}</dt><dd>${esc(n.detail ?? '')}</dd></div>`).join('')}</dl>
<ul class="cs-list">${a.edges.map((e) => `<li>${label(e.from)} to ${label(e.to)}${e.label ? ` (${esc(e.label)})` : ''}</li>`).join('')}</ul>
</details>`;
    }
    case 'data-model': {
      const m = s.dataModel;
      return `<figure class="cs-figure">
  <p class="scroll-hint mono" aria-hidden="true">Swipe sideways to see the whole diagram</p>
  <div class="diagram-scroll" tabindex="0" role="region" aria-label="Database diagram, scrolls sideways on small screens">${svg(dataModelDiagram(m))}</div>
  <figcaption>${esc(m.caption)}</figcaption>
</figure>
<details class="cs-alt"><summary>Read the tables as text</summary>
<dl>${m.tables.map((t) => `<div><dt>${esc(t.name)}</dt><dd class="mono">${esc(t.fields.join(', '))}</dd></div>`).join('')}</dl>
</details>`;
    }
  }
}

export function caseStudy(o: RenderOptions, p: Project): string {
  const sections = caseStudySections(p).map((s) => ({ id: s.id, title: s.title, html: sectionHtml(s, p) }));

  const toc = sections.map((s, i) => `<li><a href="#${s.id}" data-toc="${s.id}"><span class="mono">${String(i + 1).padStart(2, '0')}</span>${esc(s.title)}</a></li>`).join('');
  const body = sections
    .map((s, i) => `<section class="cs-section reveal" id="${s.id}" aria-labelledby="${s.id}-h"><h2 id="${s.id}-h"><span class="mono">${String(i + 1).padStart(2, '0')}</span>${esc(s.title)}</h2>${s.html}</section>`)
    .join('\n');

  const links = [
    p.repoUrl ? `<a class="text-link" href="${esc(p.repoUrl)}" target="_blank" rel="noopener">${ic('github')}Source on GitHub</a>` : '<span class="muted">No public repository yet</span>',
    p.liveUrl ? `<a class="text-link" href="${esc(p.liveUrl)}" target="_blank" rel="noopener">Live demo ${ic('arrow-up-right')}</a>` : '<span class="muted">No live demo yet</span>',
  ].join('');

  const media = p.image
    ? `<img src="${link(o, p.image.src)}" alt="${esc(p.image.alt)}" width="${p.image.width}" height="${p.image.height}">`
    : `${svg(projectPreview(p.preview, p.title))}<span class="media-label mono">Concept visual, not a screenshot</span>`;

  const next = nextProject(p);

  return `<article class="case-study" data-domain="${p.domain}">
  <header class="cs-hero">
    <div class="container">
      <a class="cs-back text-link" href="${link(o, '/#work')}">${ic('arrow-left')}All work</a>
      <div class="cs-hero-grid">
        <h1>${esc(p.title)}</h1>
        <p class="cs-summary">${esc(p.summary)}</p>
      </div>
      <dl class="cs-meta">
        <div><dt>Category</dt><dd>${esc(p.category)}</dd></div>
        <div><dt>Status</dt><dd><span class="status status--${p.status}">${statusLabel[p.status]}</span></dd></div>
        <div><dt>Stack</dt><dd>${esc(p.tech.join(', '))}</dd></div>
        <div><dt>Links</dt><dd class="cs-links">${links}</dd></div>
      </dl>
      <div class="cs-media card-media">${media}</div>
    </div>
  </header>
  <div class="container cs-body">
    <nav class="cs-toc" aria-label="On this page"><p class="mono">On this page</p><ol>${toc}</ol></nav>
    <div class="cs-content">${body}</div>
  </div>
  <nav class="cs-next" aria-label="Next case study">
    <div class="container">
      <a href="${link(o, projectPath(next))}" data-domain="${next.domain}">
        <span class="mono">Next case study</span>
        <span class="cs-next-title">${esc(next.title)} ${ic('arrow-right')}</span>
      </a>
    </div>
  </nav>
</article>`;
}

export function privacy(o: RenderOptions): string {
  const sections = privacySections()
    .map(
      (s) => `<section aria-labelledby="pv-${slugify(s.title)}">
  <h2 id="pv-${slugify(s.title)}">${esc(s.title)}</h2>
  ${(s.paragraphs ?? []).map((t) => `<p>${esc(t)}</p>`).join('')}
  ${s.items?.length ? list(s.items) : ''}
</section>`,
    )
    .join('\n');
  const updated = new Date(privacyUpdated + 'T12:00:00Z').toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  return `<article class="legal">
  <div class="container">
    <a class="cs-back text-link" href="${link(o, '/')}">${ic('arrow-left')}Home</a>
    <h1>Privacy notice</h1>
    <p class="legal-updated mono">Last updated <time datetime="${privacyUpdated}">${updated}</time></p>
    <div class="legal-body">${sections}</div>
  </div>
</article>`;
}

const slugify = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function notFound(o: RenderOptions): string {
  const projects = featuredProjects()
    .map((p) => `<li><a href="${link(o, projectPath(p))}" data-domain="${p.domain}">${esc(p.title)}</a></li>`)
    .join('');
  return `<section class="section not-found" aria-labelledby="nf-title">
  <div class="container nf-grid">
    <div class="nf-copy">
      <p class="nf-request mono" hidden><span class="nf-method">GET</span> <span class="nf-path" data-requested-path></span> <span class="nf-status">404 Not Found</span></p>
      <h1 id="nf-title">This page doesn’t exist.</h1>
      <p class="nf-lead">The link may be out of date, or the address may have a typo. Here’s where you can go instead.</p>
      <div class="hero-actions"><a class="btn btn--primary" href="${link(o, '/')}">Go to the home page</a><a class="btn" href="${link(o, '/#work')}">See my work</a></div>
      <nav class="nf-links" aria-labelledby="nf-links-title">
        <p class="mono" id="nf-links-title">Case studies</p>
        <ul>${projects}</ul>
      </nav>
    </div>
    <div class="nf-visual">${svg(brokenSystem())}</div>
  </div>
</section>`;
}
