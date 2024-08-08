import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SfxService } from "../services/sfx-service.service";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-player-chp",
  templateUrl: "./player-chp.component.html",
  styleUrls: ["./player-chp.component.scss"],
})
export class PlayerChpComponent implements OnInit {
  answerButtonDisabled = true;
  constructor(
    public router: Router,
    private sfxService: SfxService,
    public auth: AuthService
  ) {}
  question: any = {};
  time: number = 0;
  chpData: any = {};
  audio: any = null;
  currentTurn: number = -1;
  ifGotTurn: boolean = false;
  ngOnInit(): void {
    this.auth.resetListeners();
    this.auth.socket.emit("get-chp-data", (data) => {
      this.chpData = data;
    });
    this.auth.socket.on("play-sfx", (sfxID) => {
      this.sfxService.playSfx(sfxID);
    });
    this.auth.socket.on("update-chp-question", (data) => {
      this.question = data;
    });
    this.auth.socket.on("got-turn-chp", (data) => {
      if (this.auth.userInfo().index! == data) {
        this.ifGotTurn = true;
      }
      this.currentTurn = data;
    });
    this.auth.socket.on("clear-turn-chp", () => {
      this.currentTurn = -1;
      this.ifGotTurn = false;
    });
    this.auth.socket.on("unlock-button-chp", () => {
      this.answerButtonDisabled = false;
    });
    this.auth.socket.on("lock-button-chp", () => {
      this.answerButtonDisabled = true;
    });
    this.auth.socket.on("update-clock", (clock) => {
      this.time = clock;
    });
    this.auth.socket.on("update-chp-data", (data) => {
      this.chpData = data;
    });
  }

  getAnswerTurn() {
    this.auth.socket.emit("get-turn-chp");
  }
}
