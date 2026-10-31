import { site } from '../content/site.config';
import { projects, featuredProjects } from '../content/projects';
import type { Project } from '../content/types';

export const displayName = (): string => site.wordmark || site.name;

export const initials = (): string =>
  (site.monogram ||
    site.name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')).toUpperCase().slice(0, 2);

const norm = (s: string): string => s.toLowerCase().trim();

/** Featured projects whose tech list includes this skill — always derived, never typed by hand. */
export const projectsUsing = (skill: string): Project[] =>
  featuredProjects().filter((p) => p.tech.some((t) => norm(t) === norm(skill)));

export const absoluteUrl = (path: string): string => `${site.siteUrl.replace(/\/$/, '')}${path}`;

export const projectPath = (p: Project): string => `/work/${p.slug}/`;

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  type: 'website' | 'article';
  jsonLd: object[];
  /** Keep the page out of search results. */
  noindex?: boolean;
}

export function homeMeta(): PageMeta {
  const sameAs = [site.contact.github, site.contact.linkedin].filter((x): x is string => !!x);
  const person: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: absoluteUrl('/'),
    jobTitle: site.role,
    knowsAbout: ['Full-stack web development', 'Angular', 'FastAPI', 'Relational databases', 'AI application development', 'Cybersecurity'],
  };
  if (sameAs.length) person['sameAs'] = sameAs;
  return {
    title: `${site.name} — ${site.role}`,
    description: site.description,
    path: '/',
    type: 'website',
    jsonLd: [
      person,
      { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: absoluteUrl('/') },
    ],
  };
}

export function projectMeta(p: Project): PageMeta {
  return {
    title: `${p.title} — Case study | ${site.name}`,
    description: p.summary,
    path: projectPath(p),
    type: 'article',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Work', item: absoluteUrl('/#work') },
          { '@type': 'ListItem', position: 3, name: p.title, item: absoluteUrl(projectPath(p)) },
        ],
      },
    ],
  };
}

export const privacyMeta = (): PageMeta => ({
  title: `Privacy notice | ${site.name}`,
  description: 'How this site handles your information: no cookies or tracking, and contact form messages used only to reply.',
  path: '/privacy/',
  type: 'website',
  jsonLd: [],
});

export const notFoundMeta = (): PageMeta => ({
  title: `Page not found | ${site.name}`,
  description: 'This page does not exist.',
  path: '/404.html',
  type: 'website',
  jsonLd: [],
  noindex: true,
});

/** Every public URL, for the sitemap. */
export const sitemapPaths = (): string[] => ['/', ...featuredProjects().map(projectPath), '/privacy/'];

/** Neighbouring featured project for the "next case study" link. */
export function nextProject(p: Project): Project {
  const list = featuredProjects();
  const i = list.findIndex((x) => x.slug === p.slug);
  return list[(i + 1) % list.length];
}

export { projects };
