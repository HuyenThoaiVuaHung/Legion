import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlayerKhoiDongComponent } from './player-khoi-dong/player-khoi-dong.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'plkd', component: PlayerKhoiDongComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
