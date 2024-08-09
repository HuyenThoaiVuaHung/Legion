import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { McComponent } from "./mc/mc.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  {
    path: "player",
    loadChildren: () =>
      import("./player/player.module").then((m) => m.PlayerModule),
  },
  {
    path: "admin",
    loadChildren: () =>
      import("./admin/admin.module").then((m) => m.AdminModule),
  },
  {
    path: "misc",
    loadChildren: () => import("./misc/misc.module").then((m) => m.MiscModule),
  },
  { path: "mc", component: McComponent },
  { path: "**", component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
