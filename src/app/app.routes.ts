import { Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'connect',
    pathMatch: 'full',
  },
  {
    path: 'connect',
    component: IndexComponent
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
    loadChildren: () => import('./admin/admin.routing')
  },
  {
    path: 'player',
    loadComponent: () => import('./player/player.component').then(m => m.PlayerComponent),
    loadChildren: () => import('./player/player.routing').then(m => m.routes),
  },
  {
    path: 'editor',
    loadComponent: () => import('./editor/editor.component').then(m => m.EditorComponent),
    loadChildren: () => import('./editor/editor.routing').then(m => m.routes),
  },
  {
    path: 'misc',
    loadChildren: () => import('./misc/misc.routing').then(m => m.routes),
  },
  {
    path: '404',
    loadComponent: () => import('./misc/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
