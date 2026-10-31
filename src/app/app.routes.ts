import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'work/:slug',
    loadComponent: () => import('./pages/project/project.page').then((m) => m.ProjectPage),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy.page').then((m) => m.PrivacyPage),
  },
  {
    path: 'not-found',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
