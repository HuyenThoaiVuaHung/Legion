import { Routes, RouterModule, Route } from '@angular/router';
import { AdminKdComponent } from './kd/kd.component';
import { AdminVcnvComponent } from './vcnv/vcnv.component';
import { AdminTtComponent } from './tt/tt.component';
import { AdminChpComponent } from './chp/chp.component';
import { AdminEditorComponent } from './editor/editor.component';

const routes: Routes = [
  { path: '', redirectTo: '/admin/editor', pathMatch: 'full' },
  { path: 'editor', component: AdminEditorComponent,
    loadChildren: () => import('../editor/editor.routing').then(m => m.routes)
   },
  { path: 'kd', component: AdminKdComponent },
  { path: 'vcnv', component: AdminVcnvComponent },
  { path: 'tt', component: AdminTtComponent },
  { path: 'chp', component: AdminChpComponent },
  { path: '**', redirectTo: '/admin/editor' }
];

export default routes;
