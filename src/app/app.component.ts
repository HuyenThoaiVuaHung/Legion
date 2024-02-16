import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { getControlUrlFromMatchPosition } from "./services/tools";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "Legion";
  isBlocked: boolean = true;
  matchPosCache: string = "";
  closeBlockFrame() {
    this.isBlocked = false;
  }
  constructor(private router: Router, public auth: AuthService) {}
  ngOnInit(): void {}
  changeMatchPosAdmin(pos: string) {
    this.router.navigate([getControlUrlFromMatchPosition(pos)]);
  }
  togglePoints() {
    this.auth.socket.emit("get-match-data", (data: { matchPos: string }) => {
      if (data.matchPos == "PNTS") {
        if (this.matchPosCache )
        this.router.navigate([getControlUrlFromMatchPosition(this.matchPosCache)]);
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
