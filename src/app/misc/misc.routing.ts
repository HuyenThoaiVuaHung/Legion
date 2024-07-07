import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'general-points',
    loadComponent: () => import('./general-points/general-points.component').then(m => m.GeneralPointsComponent),
  },
  {
    path: 'single-points',
    loadComponent: () => import('./single-points/single-points.component').then(m => m.SinglePointsComponent),
  },
  {
    path: 'mc',
    loadComponent: () => import('./mc/mc.component').then(m => m.McComponent),
  },
  {
    path: 'stream',
    children: [
      {
        path: 'kd-stream',
        loadComponent: () => import('./stream/kd-stream/kd-stream.component').then(m => m.KdStreamComponent),
      },
      {
        path: 'vd-stream',
        loadComponent: () => import('./stream/vd-stream/vd-stream.component').then(m => m.VdStreamComponent),
      },
      {
        path: 'question-picker',
        loadComponent: () => import('./stream/question-picker/question-picker.component').then(m => m.QuestionPickerComponent),
      }
    ]
  },
  {
    path: '**',
    redirectTo: '404'
  }
];

