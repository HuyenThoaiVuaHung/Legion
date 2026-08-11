import { Component, OnInit, Signal, computed, ChangeDetectionStrategy, inject } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { FormPlayerComponent } from "../components/forms/form-player/form-player.component";
import { AuthService } from "../services/auth.service";
import { Validators, FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { NetworkStatus } from "../services/types/network.enum";
import { AppState } from "../services/types/app";
import { MatStepper, MatStep, MatStepperNext, MatStepperIcon } from "@angular/material/stepper";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatStepper, MatStep, ReactiveFormsModule, MatFormField, MatInput, MatLabel, MatButton, MatIcon, MatProgressSpinner, MatStepperNext, MatStepperIcon]
})
export class HomeComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  auth = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

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
    if (this.auth.userInfo().roleId == 2) this.router.navigate(["mc"]);
    localStorage.setItem("authString", this.tokenFormGroup.value.token!);
  }
}
