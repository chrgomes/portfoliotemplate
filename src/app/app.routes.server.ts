import { RenderMode, ServerRoute } from '@angular/ssr';
import { featuredProjects } from '../content/projects';

/**
 * Every public page is pre-rendered to its own index.html at build time,
 * so GoDaddy only ever serves static files.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  {
    path: 'work/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => featuredProjects().map((p) => ({ slug: p.slug })),
  },
  { path: 'privacy', renderMode: RenderMode.Prerender },
  // Copied to /404.html by tools/angular-postbuild.ts.
  { path: 'not-found', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
