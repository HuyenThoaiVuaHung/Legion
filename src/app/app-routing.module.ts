import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControlChpComponent } from './control-chp/control-chp.component';
import { HomeComponent } from './home/home.component';
import { McComponent } from './mc/mc.component';
import { PlayerChpComponent } from './player-chp/player-chp.component';
import { PointsViewComponent } from './points-view/points-view.component';
import { SinglePointTsComponent } from './single-point-ts/single-point-ts.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'pl-chp', component: PlayerChpComponent },
  {path: 'c-chp', component: ControlChpComponent},
  {path: 'pnts', component: PointsViewComponent},
  {path: 'mc', component: McComponent},
  {path: 'rl-pnts', component: SinglePointTsComponent},
  {path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
