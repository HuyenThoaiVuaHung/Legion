import { Component, OnInit, Signal, computed } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { FormPlayerComponent } from "../components/forms/form-player/form-player.component";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    public auth: AuthService,
    private dialog: MatDialog,
  ) {}
  displayedPlayerColumns: string[] = ["id", "name", "score", "active"];
  authString: string = "";
  greetString: Signal<string> = computed(() => {
    switch (this.auth.userInfo().roleId) {
      case 0:
        return this.auth.matchData().players[this.auth.userInfo().index || 0]
          .name;
      case 1:
        this.auth.socket.emit("change-match-position", "H");
        return "Ban tổ chức";
      case 2:
        return "Người dẫn chương trình";
      case 3:
        return "Viewer";
      default:
        return "Chào bạn";
    }
  });
  async ngOnInit(): Promise<void> {
    this.auth.deauthenticate();
  }
  async authenticate() {
    await this.auth.authenticate(this.authString);
    if (this.auth.userInfo().roleId == 1) this.router.navigate(["admin"]);
    localStorage.setItem("authString", this.authString);
  }
}
