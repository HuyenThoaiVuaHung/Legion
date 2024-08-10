import { Component, OnInit } from "@angular/core";
import { io } from "socket.io-client";
import { AuthService } from "src/app/services/auth.service";
import { VdData } from "src/app/services/types/game";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-sc-question-bar",
  templateUrl: "./sc-question-bar.component.html",
  styleUrls: ["./sc-question-bar.component.scss"],
})
export class ScQuestionBarComponent {
  constructor(public auth: AuthService) {
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
