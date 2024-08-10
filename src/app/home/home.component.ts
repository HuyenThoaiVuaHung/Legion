import { Component, OnInit, Signal, computed } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { FormPlayerComponent } from "../components/forms/form-player/form-player.component";
import { AuthService } from "../services/auth.service";
import { Validators, FormBuilder } from "@angular/forms";
import { NetworkStatus } from "../services/types/network.enum";
import { AppState } from "../services/types/app";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  errorMsg: string = "";
  urlFormGroup = this._formBuilder.group({
    legendaryUrl: [
      "http://",
      [Validators.pattern(/(http:\x2f\x2f)[A-Za-z0-9.\x2f:]+/)],
    ],
  });
  tokenFormGroup = this._formBuilder.group({
    token: ["", [Validators.required]],
  });

  appState = AppState;
  constructor(
    private _formBuilder: FormBuilder,
    public auth: AuthService,
    private router: Router,
    private dialog: MatDialog
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
    if (localStorage.getItem("defaultUrl")) {
      this.urlFormGroup.setValue({
        legendaryUrl: localStorage.getItem("defaultUrl"),
      });
      this.auth.connect(localStorage.getItem("defaultUrl")!);
    }
  }
  connect() {
    if (
      localStorage.getItem("defaultUrl") !==
      this.urlFormGroup.value.legendaryUrl
    ) {
      this.auth.connect(this.urlFormGroup.value.legendaryUrl!);
    }
  }
  login() {}
  async authenticate() {
    await this.auth.authenticate(this.tokenFormGroup.value.token!);
    if (this.auth.userInfo().roleId == 1) this.router.navigate(["admin"]);
    localStorage.setItem("authString", this.tokenFormGroup.value.token!);
  }
}
