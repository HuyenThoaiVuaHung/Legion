import { Routes } from '@angular/router';

/**
 * Stream-overlay / broadcast-graphics screens (OBS browser sources etc).
 * Path segments match the old child paths one-to-one so existing overlay
 * URLs configured in OBS keep working.
 */
export const MISC_ROUTES: Routes = [
  {
    path: 'sc-khoi-dong',
    loadComponent: () =>
      import('./sc-khoi-dong/sc-khoi-dong.component').then((m) => m.ScKhoiDongComponent),
  },
  {
    path: 'sc-question-bar',
    loadComponent: () =>
      import('./sc-question-bar/sc-question-bar.component').then(
        (m) => m.ScQuestionBarComponent,
      ),
  },
  {
    path: 'sc-ve-dich',
    loadComponent: () =>
      import('./sc-ve-dich/sc-ve-dich.component').then((m) => m.ScVeDichComponent),
  },
  {
    path: 'single-point-ts/:id',
    loadComponent: () =>
      import('./single-point-ts/single-point-ts.component').then(
        (m) => m.SinglePointTsComponent,
      ),
  },
];
