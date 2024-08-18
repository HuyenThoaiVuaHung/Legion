import { Component, OnInit } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { AuthService } from "src/app/services/auth.service";
import { KdQuestion } from "src/app/services/types/game";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-sc-khoi-dong",
  templateUrl: "./sc-khoi-dong.component.html",
  styleUrls: ["./sc-khoi-dong.component.scss"],
})
export class ScKhoiDongComponent implements OnInit {
  constructor(public auth: AuthService) {}
  currentQuestion: KdQuestion | undefined;
  time = 0;
  currentMaxQuestionNo = 0;

  currentQuestionNo: number = 0;

  threeSecTimers: number[] = [0, 0];
  playerGotTurn: any = {};
  ngOnInit(): void {
    this.auth.resetListeners();

    this.auth.socket.on("update-kd-question", (question) => {
      if (question != undefined) {
        this.currentQuestion = question;
      } else {
        this.currentQuestion = undefined;
      }
    });
    this.auth.socket.on("update-number-question-kd", (max, curr) => {
      this.currentMaxQuestionNo = max;
      this.currentQuestionNo = curr;
    });
    this.auth.socket.on("player-got-turn-kd", (player) => {
      if (player != undefined) {
        this.playerGotTurn = player;
      }
    });
    this.auth.socket.on("clear-turn-player-kd", () => {
      this.playerGotTurn = {};
    });
    this.auth.socket.on("update-clock", (time) => {
      this.time = time;
    });
    this.auth.socket.on("update-3s-timer-kd", (time, ifPlayer) => {
      if (ifPlayer == true) {
        this.threeSecTimers[1] = time;
      } else {
        this.threeSecTimers[0] = time;
      }
    });
  }
}
