import { Routes } from '@angular/router';
import { EditorGeneralComponent } from './general/general.component';
import { EditorKdComponent } from './kd/kd.component';
import { EditorVcnvComponent } from './vcnv/vcnv.component';
import { EditorTtComponent } from './tt/tt.component';
import { EditorVdComponent } from './vd/vd.component';
import { EditorChpComponent } from './chp/chp.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/editor/general',
    pathMatch: 'full'
   },
   {
    path: 'general',
    component: EditorGeneralComponent
   },
   {
    path: 'kd',
    component: EditorKdComponent
   },
   {
    path: 'vcnv',
    component: EditorVcnvComponent
   },
   {
    path: 'tt',
    component: EditorTtComponent
   },
   {
    path: 'vd',
    component: EditorVdComponent
   },
   {
    path: 'chp',
    component: EditorChpComponent
   },
    {
      path: '**',
      redirectTo: '/404'
    }
];

