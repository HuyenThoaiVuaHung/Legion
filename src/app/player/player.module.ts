import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PlayerKhoiDongComponent } from "./player-khoi-dong/player-khoi-dong.component";
import { PlayerTangtocAComponent } from "./player-tangtoc-a/player-tangtoc-a.component";
import { PlayerTangtocQComponent } from "./player-tangtoc-q/player-tangtoc-q.component";
import { PlayerVcnvAnswerComponent } from "./player-vcnv-answer/player-vcnv-answer.component";
import { PlayerVcnvQuestionComponent } from "./player-vcnv-question/player-vcnv-question.component";
import { PlayerVedichComponent } from "./player-vedich/player-vedich.component";
import { RouterModule, Routes } from "@angular/router";
import { PlayerChpComponent } from "./player-chp/player-chp.component";
import { MatchPosGuard } from "../services/guards/match-pos.guard";
import { MenuItemComponent } from "../components/menu-item/menu-item.component";
import { PlayerListComponent } from "../components/player-list/player-list.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CountdownComponent } from '../components/countdown/countdown.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { PointsViewComponent } from './points-view/points-view.component';
import { PlayerComponent } from './player.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

export const playerRoutes: Routes = [
  {
    path: "kd",
    component: PlayerKhoiDongComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: "vcnv-q",
    component: PlayerVcnvQuestionComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: "vcnv-a",
    component: PlayerVcnvAnswerComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: "tangtoc-q",
    component: PlayerTangtocQComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: "tangtoc-a",
    component: PlayerTangtocAComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: "vd",
    component: PlayerVedichComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: "chp",
    component: PlayerChpComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: 'points',
    component: PointsViewComponent,
    canActivate: [MatchPosGuard]
  }
];

@NgModule({
  declarations: [
    PlayerKhoiDongComponent,
    PlayerVcnvQuestionComponent,
    PlayerVcnvAnswerComponent,
    PlayerTangtocQComponent,
    PlayerTangtocAComponent,
    PlayerVedichComponent,
    PlayerChpComponent,
    PointsViewComponent,
    PlayerComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(playerRoutes),
    MenuItemComponent,
    PlayerListComponent,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    CountdownComponent,
    MatProgressBarModule,
    MatInputModule,
    MatSnackBarModule,
    MatCheckboxModule
  ],
  exports: [RouterModule],
  bootstrap: [PlayerComponent]
})
export class PlayerModule {}
