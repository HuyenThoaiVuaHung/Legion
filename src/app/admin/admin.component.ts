import { Component } from "@angular/core";
import { getControlUrlFromMatchPosition } from "../services/tools";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrl: "./admin.component.scss",
})
export class AdminComponent {
  constructor(private router: Router, public auth: AuthService) {}
  changeMatchPosAdmin(pos: string) {
    this.router.navigate([getControlUrlFromMatchPosition(pos)]);
  }
  private matchPosCache: string = "";
  togglePoints() {
    this.auth.socket.emit("get-match-data", (data: { matchPos: string }) => {
      if (data.matchPos == "PNTS") {
        if (this.matchPosCache)
          this.router.navigate([
            getControlUrlFromMatchPosition(this.matchPosCache),
          ]);
        this.auth.socket.emit(
          "change-match-position",
          this.matchPosCache,
          localStorage.getItem("authString")
        );
      } else {
        this.matchPosCache = data.matchPos;
        this.auth.socket.emit(
          "change-match-position",
          "PNTS",
          localStorage.getItem("authString")
        );
      }
    });
  }
}
