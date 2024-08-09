import { MatToolbarModule } from '@angular/material/toolbar';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { AdminGuard } from "../services/guards/admin.guard";
import { ControlKhoiDongComponent } from "./control-khoi-dong/control-khoi-dong.component";
import { ControlChpComponent } from "./control-chp/control-chp.component";
import { ControlTangtocComponent } from "./control-tangtoc/control-tangtoc.component";
import { ControlVcnvComponent } from "./control-vcnv/control-vcnv.component";
import { ControlVdComponent } from "./control-vd/control-vd.component";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { MenuItemComponent } from "../components/menu-item/menu-item.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AdminComponent } from "./admin.component";

export const adminRoutes: Routes = [
  {
    path: "kd",
    component: ControlKhoiDongComponent,
    canActivate: [AdminGuard],
  },
  {
    path: "vcnv",
    component: ControlVcnvComponent,
    canActivate: [AdminGuard],
  },
  {
    path: "tt",
    component: ControlTangtocComponent,
    canActivate: [AdminGuard],
  },
  {
    path: "vd",
    component: ControlVdComponent,
    canActivate: [AdminGuard],
  },
  {
    path: "chp",
    component: ControlChpComponent,
    canActivate: [AdminGuard],
  },
];

@NgModule({
  declarations: [
    ControlKhoiDongComponent,
    ControlChpComponent,
    ControlTangtocComponent,
    ControlVcnvComponent,
    ControlVdComponent,
    AdminComponent
  ],
  imports: [
    MenuItemComponent,
    RouterModule.forChild(adminRoutes),
    CommonModule,
    MatIconModule,
    MatCheckboxModule,
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MenuItemComponent,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinner,
    MatToolbarModule,
  ],
  bootstrap: [AdminComponent],
  exports: [RouterModule],
})
export class AdminModule {}
