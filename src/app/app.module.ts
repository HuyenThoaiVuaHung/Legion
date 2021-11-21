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


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PlayerKhoiDongComponent,
    PlayerVcnvQuestionComponent,
    PlayerVcnvAnswerComponent,
    PlayerTangtocQComponent,
  
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
