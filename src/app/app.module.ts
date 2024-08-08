import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { HomeComponent } from './home/home.component';
import { PlayerKhoiDongComponent } from './player-khoi-dong/player-khoi-dong.component';
import { PlayerVcnvQuestionComponent } from './player-vcnv-question/player-vcnv-question.component';
import { PlayerVcnvAnswerComponent } from './player-vcnv-answer/player-vcnv-answer.component';
import { PlayerTangtocQComponent } from './player-tangtoc-q/player-tangtoc-q.component';
import { PlayerTangtocAComponent } from './player-tangtoc-a/player-tangtoc-a.component';
import { PlayerVedichComponent } from './player-vedich/player-vedich.component';
import { ControlKhoiDongComponent } from './control-khoi-dong/control-khoi-dong.component';
import { ControlVcnvComponent } from './control-vcnv/control-vcnv.component';
import { FormQKdComponent } from './form-q-kd/form-q-kd.component';
import { FormPlayerComponent } from './form-player/form-player.component';
import { FormQVcnvComponent } from './form-q-vcnv/form-q-vcnv.component';
import { ControlTangtocComponent } from './control-tangtoc/control-tangtoc.component';
import { FormQTtComponent } from './form-q-tt/form-q-tt.component';
import { ControlVdComponent } from './control-vd/control-vd.component';
import { FormQVdComponent } from './form-q-vd/form-q-vd.component';
import { McComponent } from './mc/mc.component';
import { ScKhoiDongComponent } from './sc-khoi-dong/sc-khoi-dong.component';
import { ScVeDichComponent } from './sc-ve-dich/sc-ve-dich.component';
import { ScQuestionBarComponent } from './sc-question-bar/sc-question-bar.component';
import { ControlChpComponent } from './control-chp/control-chp.component';
import { PlayerChpComponent } from './player-chp/player-chp.component';
import { FormQChpComponent } from './form-q-chp/form-q-chp.component';
import { PointsViewComponent } from './points-view/points-view.component';
import { FormQchpComponent } from './form-qchp/form-qchp.component';
import { SinglePointTsComponent } from './single-point-ts/single-point-ts.component';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { CountdownComponent } from './components/countdown/countdown.component';
import { MenuItemComponent } from './components/menu-item/menu-item.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PlayerKhoiDongComponent,
    PlayerVcnvQuestionComponent,
    PlayerVcnvAnswerComponent,
    PlayerTangtocQComponent,
    PlayerTangtocAComponent,
    PlayerVedichComponent,
    ControlKhoiDongComponent,
    ControlVcnvComponent,
    FormQKdComponent,
    FormPlayerComponent,
    FormQVcnvComponent,
    ControlTangtocComponent,
    FormQTtComponent,
    ControlVdComponent,
    FormQVdComponent,
    McComponent,
    ScKhoiDongComponent,
    ScVeDichComponent,
    ScQuestionBarComponent,
    ControlChpComponent,
    PlayerChpComponent,
    FormQChpComponent,
    PointsViewComponent,
    FormQchpComponent,
    SinglePointTsComponent,
    PlayerListComponent,
    CountdownComponent,
    MenuItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
