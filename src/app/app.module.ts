import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { HomeComponent } from './home/home.component';
import { FormPlayerComponent } from './form-player/form-player.component';
import { McComponent } from './mc/mc.component';
import { ControlChpComponent } from './control-chp/control-chp.component';
import { PlayerChpComponent } from './player-chp/player-chp.component';
import { FormQChpComponent } from './form-q-chp/form-q-chp.component';
import { PointsViewComponent } from './points-view/points-view.component';
import { FormQchpComponent } from './form-qchp/form-qchp.component';
import { SinglePointTsComponent } from './single-point-ts/single-point-ts.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FormPlayerComponent,
    McComponent,
    ControlChpComponent,
    PlayerChpComponent,
    FormQChpComponent,
    PointsViewComponent,
    FormQchpComponent,
    SinglePointTsComponent,
  
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
