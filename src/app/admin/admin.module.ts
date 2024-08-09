import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from "@angular/material/toolbar";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
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
import { AdminDashboardComponent } from "./dashboard/dashboard.component";
import { MatTooltipModule } from "@angular/material/tooltip";

export const adminRoutes: Routes = [
  {
    path: "",
    redirectTo: "/admin/dashboard",
    pathMatch: "full",
  },
  {
    path: "dashboard",
    component: AdminDashboardComponent,
  },
  {
    path: "kd",
    component: ControlKhoiDongComponent,
  },
  {
    path: "vcnv",
    component: ControlVcnvComponent,
  },
  {
    path: "tt",
    component: ControlTangtocComponent,
  },
  {
    path: "vd",
    component: ControlVdComponent,
  },
  {
    path: "chp",
    component: ControlChpComponent,
  },
  {
    path: "**",
    redirectTo: "/404",
  }
];

@NgModule({
  declarations: [
    ControlKhoiDongComponent,
    ControlChpComponent,
    ControlTangtocComponent,
    ControlVcnvComponent,
    ControlVdComponent,
    AdminComponent,
    AdminDashboardComponent,
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
    MatTooltipModule,
    MatExpansionModule
  ],
  bootstrap: [AdminComponent],
  exports: [RouterModule],
})
export class AdminModule {}
