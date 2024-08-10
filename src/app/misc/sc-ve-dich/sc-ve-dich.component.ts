import { Component, OnInit } from "@angular/core";
import { io } from "socket.io-client";
import { AuthService } from "src/app/services/auth.service";
import { VdData } from "src/app/services/types/game";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-sc-ve-dich",
  templateUrl: "./sc-ve-dich.component.html",
  styleUrls: ["./sc-ve-dich.component.scss"],
})
export class ScVeDichComponent implements OnInit {
  constructor(public auth: AuthService) {
    console.log(document.URL.match(/(http:\x2f\x2f)[A-Za-z0-9\.]+/)![0]);
    if (!localStorage.getItem("defaultUrl"))
      this.auth.connect(
        document.URL.match(/(http:\x2f\x2f)[A-Za-z0-9\.]+/)![0]
      );
    
    this.auth.socket.emit("get-vedich-data", (callback) => {
      this.vdData = callback;
    });
    this.auth.socket.on("update-vedich-data", (data) => {
      this.vdData = data;
    });
  }
  public vdData: VdData | undefined;
  currentQuestion: any = {};
  time = 0;
  playerStealingQuestion: number = -1;
  ngOnInit(): void {
    this.auth.socket.on("update-vedich-question", (question) => {
      if (question != undefined) {
        this.currentQuestion = question;
      } else {
        this.currentQuestion = {};
      }
    });
    this.auth.socket.on("player-steal-question", (id) => {
      this.playerStealingQuestion = id;
    });
    this.auth.socket.on("clear-stealing-player", () => {
      this.playerStealingQuestion = -1;
    });
    this.auth.socket.on("update-clock", (time) => {
      this.time = time;
    });
  }
}
