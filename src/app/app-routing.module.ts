import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControlKhoiDongComponent } from './control-khoi-dong/control-khoi-dong.component';
import { ControlTangtocComponent } from './control-tangtoc/control-tangtoc.component';
import { ControlVcnvComponent } from './control-vcnv/control-vcnv.component';
import { ControlVdComponent } from './control-vd/control-vd.component';
import { HomeComponent } from './home/home.component';
import { McComponent } from './mc/mc.component';
import { PlayerKhoiDongComponent } from './player-khoi-dong/player-khoi-dong.component';
import { PlayerTangtocAComponent } from './player-tangtoc-a/player-tangtoc-a.component';
import { PlayerTangtocQComponent } from './player-tangtoc-q/player-tangtoc-q.component';
import { PlayerVcnvAnswerComponent } from './player-vcnv-answer/player-vcnv-answer.component';
import { PlayerVcnvQuestionComponent } from './player-vcnv-question/player-vcnv-question.component';
import { PlayerVedichComponent } from './player-vedich/player-vedich.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'pl-kd', component: PlayerKhoiDongComponent },
  {path: 'pl-vcnv-q', component: PlayerVcnvQuestionComponent },
  {path: 'pl-vcnv-a', component: PlayerVcnvAnswerComponent },
  {path: 'pl-tangtoc-q', component: PlayerTangtocQComponent },
  {path: 'pl-tangtoc-a', component: PlayerTangtocAComponent },
  {path: 'pl-vd', component: PlayerVedichComponent },
  {path: 'c-kd', component: ControlKhoiDongComponent },
  {path: 'c-vcnv', component: ControlVcnvComponent },
  {path: 'c-tt', component: ControlTangtocComponent },
  {path: 'c-vd', component: ControlVdComponent },
  {path: 'mc', component: McComponent},
  {path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
