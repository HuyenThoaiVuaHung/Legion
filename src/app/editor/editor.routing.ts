import { ActivatedRoute, Router, Routes } from '@angular/router';
import { EditorGeneralComponent } from './general/general.component';
import { EditorKdComponent } from './kd/kd.component';
import { EditorVcnvComponent } from './vcnv/vcnv.component';
import { EditorTtComponent } from './tt/tt.component';
import { EditorVdComponent } from './vd/vd.component';
import { EditorChpComponent } from './chp/chp.component';
import { EditorDashboardComponent } from './dashboard/dashboard.component';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { EditorDataService } from './services/editor.data.service';
import { firstValueFrom } from 'rxjs';

export const editorRouteGuard: CanActivateFn = (route, state,) => {
  const editorDataSvc = inject(EditorDataService);
  if (!editorDataSvc.editorData) {
    const router = inject(Router);
    router.navigate(['/editor'])
    return false;
  }
  return true;
};

export const routes: Routes = [
  {
    path: '',
    component: EditorDashboardComponent
  },
  {
    path: 'general',
    component: EditorGeneralComponent,
    canActivate: [editorRouteGuard]
  },
  {
    path: 'kd',
    component: EditorKdComponent,
    canActivate: [editorRouteGuard]
  },
  {
    path: 'vcnv',
    component: EditorVcnvComponent,
    canActivate: [editorRouteGuard]
  },
  {
    path: 'tt',
    component: EditorTtComponent,
    canActivate: [editorRouteGuard]
  },
  {
    path: 'vd',
    component: EditorVdComponent,
    canActivate: [editorRouteGuard]
  },
  {
    path: 'chp',
    component: EditorChpComponent,
    canActivate: [editorRouteGuard]
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];
