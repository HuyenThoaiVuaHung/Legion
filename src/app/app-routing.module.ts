import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlayerKhoiDongComponent } from './player-khoi-dong/player-khoi-dong.component';
import { PlayerTangtocAComponent } from './player-tangtoc-a/player-tangtoc-a.component';
import { PlayerTangtocQComponent } from './player-tangtoc-q/player-tangtoc-q.component';
import { PlayerVcnvAnswerComponent } from './player-vcnv-answer/player-vcnv-answer.component';
import { PlayerVcnvQuestionComponent } from './player-vcnv-question/player-vcnv-question.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'pl-kd', component: PlayerKhoiDongComponent },
  {path: 'pl-vcnv-q', component: PlayerVcnvQuestionComponent },
  {path: 'pl-vcnv-a', component: PlayerVcnvAnswerComponent },
  {path: 'pl-tangtoc-q', component: PlayerTangtocQComponent },
  {path: 'pl-tangtoc-a', component: PlayerTangtocAComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
