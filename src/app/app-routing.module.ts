import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ControlChpComponent } from "./control-chp/control-chp.component";
import { ControlKhoiDongComponent } from "./control-khoi-dong/control-khoi-dong.component";
import { ControlTangtocComponent } from "./control-tangtoc/control-tangtoc.component";
import { ControlVcnvComponent } from "./control-vcnv/control-vcnv.component";
import { ControlVdComponent } from "./control-vd/control-vd.component";
import { HomeComponent } from "./home/home.component";
import { McComponent } from "./mc/mc.component";
import { PlayerChpComponent } from "./player-chp/player-chp.component";
import { PlayerKhoiDongComponent } from "./player-khoi-dong/player-khoi-dong.component";
import { PlayerTangtocAComponent } from "./player-tangtoc-a/player-tangtoc-a.component";
import { PlayerTangtocQComponent } from "./player-tangtoc-q/player-tangtoc-q.component";
import { PlayerVcnvAnswerComponent } from "./player-vcnv-answer/player-vcnv-answer.component";
import { PlayerVcnvQuestionComponent } from "./player-vcnv-question/player-vcnv-question.component";
import { PlayerVedichComponent } from "./player-vedich/player-vedich.component";
import { PointsViewComponent } from "./points-view/points-view.component";
import { ScKhoiDongComponent } from "./sc-khoi-dong/sc-khoi-dong.component";
import { ScQuestionBarComponent } from "./sc-question-bar/sc-question-bar.component";
import { ScVeDichComponent } from "./sc-ve-dich/sc-ve-dich.component";
import { SinglePointTsComponent } from "./single-point-ts/single-point-ts.component";
import { MatchPosGuard } from "./services/guards/match-pos.guard";
import { AdminGuard } from "./services/guards/admin.guard";

const routes: Routes = [
  { path: "", component: HomeComponent },
  {
    path: "pl-kd",
    component: PlayerKhoiDongComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: "pl-vcnv-q",
    component: PlayerVcnvQuestionComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: "pl-vcnv-a",
    component: PlayerVcnvAnswerComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: "pl-tangtoc-q",
    component: PlayerTangtocQComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: "pl-tangtoc-a",
    component: PlayerTangtocAComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: "pl-vd",
    component: PlayerVedichComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: "pl-chp",
    component: PlayerChpComponent,
    canActivate: [MatchPosGuard],
  },
  {
    path: "c-kd",
    component: ControlKhoiDongComponent,
    canActivate: [AdminGuard],
  },
  {
    path: "c-vcnv",
    component: ControlVcnvComponent,
    canActivate: [AdminGuard],
  },
  {
    path: "c-tt",
    component: ControlTangtocComponent,
    canActivate: [AdminGuard],
  },
  { path: "c-vd", component: ControlVdComponent, canActivate: [AdminGuard] },
  { path: "c-chp", component: ControlChpComponent, canActivate: [AdminGuard] },
  { path: "pnts", component: PointsViewComponent },
  { path: "mc", component: McComponent },
  { path: "sc-qb", component: ScQuestionBarComponent },
  { path: "sc-vd", component: ScVeDichComponent },
  { path: "sc-kd", component: ScKhoiDongComponent },
  { path: "rl-pnts", component: SinglePointTsComponent },
  { path: "**", component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
