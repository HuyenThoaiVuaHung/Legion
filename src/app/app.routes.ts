import { Routes } from '@angular/router';
import { adminGuard, hostGuard, mcGuard, roomGuard } from './core/guards';

/** Pages a signed-in room member sees; mounted at the root for the single-room server and under room/:code when hosted. */
const roomPages = (): Routes => [
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
];

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  { path: 'r/:code/:view', loadComponent: () => import('./host/room-link.component').then(m => m.RoomLinkComponent) },
  { path: 'r/:code', loadComponent: () => import('./host/room-link.component').then(m => m.RoomLinkComponent) },
  {
    path: 'host',
    canActivate: [hostGuard],
    loadComponent: () => import('./host/host.component').then((m) => m.HostComponent),
    loadChildren: () => import('./host/host.routes').then((m) => m.HOST_ROUTES),
  },
  {
    path: 'editor',
    loadComponent: () => import('./editor/editor.component').then((m) => m.EditorComponent),
    loadChildren: () => import('./editor/editor.routing').then((m) => m.routes),
  },
  { path: 'room/:code', canActivate: [roomGuard], children: roomPages() },
  ...roomPages(),
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not.found.component').then((m) => m.NotFoundComponent),
  },
];
