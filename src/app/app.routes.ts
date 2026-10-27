import { Routes } from '@angular/router';
import { adminGuard, mcGuard, hostGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  { path: 'r/:code/:view', loadComponent: () => import('./host/room-link.component').then(m => m.RoomLinkComponent) },
  { path: 'r/:code', loadComponent: () => import('./host/room-link.component').then(m => m.RoomLinkComponent) },
  { path: 'host/auth', loadComponent: () => import('./host/host-auth.component').then(m => m.HostAuthComponent) },
  { path: 'host', canActivate: [hostGuard], loadComponent: () => import('./host/host.component').then(m => m.HostComponent) },
  {
    path: 'editor',
    loadComponent: () =>
      import('./editor/browser-editor.component').then((m) => m.BrowserEditorComponent),
  },
  {
    path: 'player',
    loadChildren: () => import('./player/player.routes').then((m) => m.PLAYER_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'misc',
    loadChildren: () => import('./misc/misc.routes').then((m) => m.MISC_ROUTES),
  },
  {
    path: 'mc',
    canActivate: [mcGuard],
    loadComponent: () => import('./mc/mc.component').then((m) => m.McComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not.found.component').then((m) => m.NotFoundComponent),
  },
];
