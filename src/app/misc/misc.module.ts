import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ScKhoiDongComponent } from './sc-khoi-dong/sc-khoi-dong.component';
import { ScQuestionBarComponent } from './sc-question-bar/sc-question-bar.component';
import { ScVeDichComponent } from './sc-ve-dich/sc-ve-dich.component';
import { SinglePointTsComponent } from './single-point-ts/single-point-ts.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

export const miscRoutes: Routes = [
  { path: "bar", component: ScQuestionBarComponent },
  { path: "vd", component: ScVeDichComponent },
  { path: "kd", component: ScKhoiDongComponent },
  { path: "points/:id", component: SinglePointTsComponent },
]

@NgModule({
  declarations: [
    ScKhoiDongComponent,
    ScQuestionBarComponent,
    ScVeDichComponent,
    SinglePointTsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(miscRoutes),
    MatIconModule,
    MatCheckboxModule,
    FormsModule
  ]
})
export class MiscModule { }
