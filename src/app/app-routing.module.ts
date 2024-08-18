import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { McComponent } from "./mc/mc.component";
import { AdminComponent } from "./admin/admin.component";
import { AdminGuard } from "./services/guards/admin.guard";
import { PlayerComponent } from "./player/player.component";
import { NotFoundComponent } from "./not-found/not.found.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  {
    path: "player",
    loadChildren: () =>
      import("./player/player.module").then((m) => m.PlayerModule),
    component: PlayerComponent
  },

  {
    path: "admin",
    loadChildren: () =>
      import("./admin/admin.module").then((m) => m.AdminModule),
    component: AdminComponent,
    canActivate: [AdminGuard],
  },
  {
    path: "misc",
    loadChildren: () => import("./misc/misc.module").then((m) => m.MiscModule),
  },
  { path: "mc", component: McComponent },
  { path: "**", component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
