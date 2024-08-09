import { Component, OnInit, Signal, computed } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { FormPlayerComponent } from "../components/forms/form-player/form-player.component";
import { AuthService } from "../services/auth.service";
import { NetworkService } from "../services/network.service";
import { FormBuilder, Validators } from "@angular/forms";
import { NetworkStatus } from "../services/types/network.enum";

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
    public network: NetworkService,
    private _formBuilder: FormBuilder
  ) {}
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
  connect() {
    if (
      localStorage.getItem("defaultUrl") !==
      this.urlFormGroup.value.legendaryUrl
    ) {
      this.network.connect(this.urlFormGroup.value.legendaryUrl!);
    }
  }
  _networkStatus = NetworkStatus;
  authString: string = "";
  greetString: Signal<string> = computed(() => {
    switch (this.auth.userInfo().roleId) {
      case 0:
        return this.auth.matchData().players[this.auth.userInfo().index || 0]
          .name;
      case 1:
        this.auth.socket().emit("change-match-position", "H");
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
    if (localStorage.getItem("defaultUrl")) {
      this.urlFormGroup.setValue({
        legendaryUrl: localStorage.getItem("defaultUrl"),
      });
    }
  }
  async authenticate() {
    localStorage.setItem("authString", this.tokenFormGroup.value.token || "");
    await this.auth.authenticate(this.tokenFormGroup.value.token || "");
    if (this.auth.userInfo().roleId == 1) this.router.navigate(["admin"]);
  }
}
