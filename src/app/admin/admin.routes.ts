import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { ControlKhoiDongComponent } from './control-khoi-dong/control-khoi-dong.component';
import { ControlVcnvComponent } from './control-vcnv/control-vcnv.component';
import { ControlTangtocComponent } from './control-tangtoc/control-tangtoc.component';
import { ControlVdComponent } from './control-vd/control-vd.component';
import { ControlChpComponent } from './control-chp/control-chp.component';
import { AppearanceComponent } from './appearance/appearance.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'kd', component: ControlKhoiDongComponent },
      { path: 'vcnv', component: ControlVcnvComponent },
      { path: 'tt', component: ControlTangtocComponent },
      { path: 'vd', component: ControlVdComponent },
      { path: 'chp', component: ControlChpComponent },
      { path: 'appearance', component: AppearanceComponent },
    ],
  },
];
