import { Component, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import { io } from "socket.io-client";
import { AuthService } from "src/app/services/auth.service";
import { VdData } from "src/app/services/types/game";
import { environment } from "src/environments/environment";
import { MatCheckbox } from "@angular/material/checkbox";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

@Component({
    selector: "app-sc-question-bar",
    templateUrl: "./sc-question-bar.component.html",
    styleUrls: ["./sc-question-bar.component.scss"],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatCheckbox, ReactiveFormsModule, FormsModule]
})
export class ScQuestionBarComponent {
  auth = inject(AuthService);

  constructor() {
    if (!localStorage.getItem("defaultUrl"))
      this.auth.connect(
        document.URL.match(/(http:\x2f\x2f)[A-Za-z0-9\.]+/)![0]
      );
    this.auth.socket.emit("get-vedich-data", (callback: VdData) => {
      this.vdData = callback;
    });
    this.auth.socket.on("update-vedich-data", (data) => {
      this.vdData = data;
    });
  }
  vdData: VdData | undefined;
}
