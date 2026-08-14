import { Routes } from '@angular/router';
import { PlayerComponent } from './player.component';

/**
 * Child paths match PLAYER_ROUTE_BY_POSITION in core/constants.ts — the
 * old player.module.ts routing (now deleted) is authoritative for the
 * segment names.
 */
export const PLAYER_ROUTES: Routes = [
  {
    path: '',
    component: PlayerComponent,
    children: [
      {
        path: 'kd',
        loadComponent: () =>
          import('./player-khoi-dong/player-khoi-dong.component').then(
            (m) => m.PlayerKhoiDongComponent,
          ),
      },
      {
        path: 'vcnv-q',
        loadComponent: () =>
          import('./player-vcnv-question/player-vcnv-question.component').then(
            (m) => m.PlayerVcnvQuestionComponent,
          ),
      },
      {
        path: 'vcnv-a',
        loadComponent: () =>
          import('./player-vcnv-answer/player-vcnv-answer.component').then(
            (m) => m.PlayerVcnvAnswerComponent,
          ),
      },
      {
        path: 'tangtoc-q',
        loadComponent: () =>
          import('./player-tangtoc-q/player-tangtoc-q.component').then(
            (m) => m.PlayerTangtocQComponent,
          ),
      },
      {
        path: 'tangtoc-a',
        loadComponent: () =>
          import('./player-tangtoc-a/player-tangtoc-a.component').then(
            (m) => m.PlayerTangtocAComponent,
          ),
      },
      {
        path: 'vd',
        loadComponent: () =>
          import('./player-vedich/player-vedich.component').then(
            (m) => m.PlayerVedichComponent,
          ),
      },
      {
        path: 'chp',
        loadComponent: () =>
          import('./player-chp/player-chp.component').then(
            (m) => m.PlayerChpComponent,
          ),
      },
      {
        path: 'points',
        loadComponent: () =>
          import('./points-view/points-view.component').then(
            (m) => m.PointsViewComponent,
          ),
      },
    ],
  },
];
