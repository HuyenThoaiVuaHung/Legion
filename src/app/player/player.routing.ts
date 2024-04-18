import { Routes } from '@angular/router';
import { PlayerKdComponent } from './kd/kd.component';
import { PlayerVcnvComponent } from './vcnv/vcnv.component';
import { PlayerTtComponent } from './tt/tt.component';
import { PlayerVdComponent } from './vd/vd.component';
import { PlayerChpComponent } from './chp/chp.component';

// For player components, lazy loading is refrained due to time critical functionality
export const routes: Routes = [
  {
    path: 'kd',
    component: PlayerKdComponent
  },
  {
    path: 'vcnv',
    component: PlayerVcnvComponent
  },
  {
    path: 'tt',
    component: PlayerTtComponent
  },
  {
    path: 'vd',
    component: PlayerVdComponent
  },
  {
    path: 'chp',
    component: PlayerChpComponent
  }
];
