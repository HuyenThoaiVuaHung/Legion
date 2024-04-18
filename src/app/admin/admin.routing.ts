import { Routes, RouterModule, Route } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminKdComponent } from './kd/kd.component';
import { AdminVcnvComponent } from './vcnv/vcnv.component';
import { AdminTtComponent } from './tt/tt.component';
import { AdminChpComponent } from './chp/chp.component';
import { AdminDashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {path: '', redirectTo: '/admin/dashboard', pathMatch: 'full'},
  {path: 'dashboard', component: AdminDashboardComponent},
  {path: 'kd', component: AdminKdComponent},
  {path: 'vcnv', component: AdminVcnvComponent},
  {path: 'tt', component: AdminTtComponent},
  {path: 'chp', component: AdminChpComponent},
  {path: '**', redirectTo: '/admin/dashboard'}
];

export default routes;
