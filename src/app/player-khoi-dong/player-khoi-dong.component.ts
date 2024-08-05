import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import io from "socket.io-client";
import { environment } from "src/environments/environment";
import { SfxService } from "../services/sfx-service.service";
import { AuthService } from "../services/auth.service";
@Component({
  selector: "app-player-khoi-dong",
  templateUrl: "./player-khoi-dong.component.html",
  styleUrls: ["./player-khoi-dong.component.scss"],
})
export class PlayerKhoiDongComponent implements OnInit {
  answerButtonDisabled = true;
  constructor(
    public router: Router,
    private sfxService: SfxService,
    public auth: AuthService
  ) {}
  question: any = {};
  threeSecTimer1: number = 0;
  threeSecTimer2: number = 0;
  audio: any = null;
  gamemode: string = "";
  currentMaxQuestionNo = 0;
  currentQuestionNo: number = 0;
  currentTurn: number = -1;
  picturePath: string = "";
  ifGotTurn: boolean = false;
  questionObservable = new Observable((observer) => {
    this.auth.socket.on("update-kd-question", (data) => {
      this.currentTurn = -1;
      this.answerCache = this.question.answer;
      observer.next(data);
    });
  });
  answerCache: string = "";
  ngOnInit(): void {
    this.auth.socket.on("play-sfx", (sfxID, loop) => {
      this.sfxService.playSfx(sfxID, loop);
    });
    this.questionObservable.subscribe((data) => {
      this.question = data;
      this.ifGotTurn = false;
      if (this.audio != null) {
        this.audio.pause();
      }
      if (this.question.type == "A") {
        this.audio = new Audio(
          "../../../assets/audio-questions/kd/" + this.question.audioFilePath
        );
        this.audio.play();
      } else if (this.question.type == "P") {
        this.picturePath =
          "../../../assets/picture-questions/kd/" + this.question.audioFilePath;
      } else if (this.question.type == "N") {
        this.picturePath = "";
      }
    });
    this.auth.socketHook = () => {
      this.auth.socket.on("clear-turn-player-kd", () => {
        this.ifGotTurn = false;
        this.currentTurn = -1;
      });
      this.auth.socket.on("player-got-turn-kd", (data) => {
        if (this.auth.userInfo.index == data.id - 1) {
          this.ifGotTurn = true;
        }
        this.currentTurn = data.id - 1;
        console.log(this.currentTurn);
      });
      this.auth.socket.on("update-number-question-kd", (max, curr) => {
        this.currentMaxQuestionNo = max;
        this.currentQuestionNo = curr;
      });
      if (this.auth.userInfo.roleId == 0) {
        this.auth.socket.on("disable-answer-button-kd", () => {
          this.answerButtonDisabled = true;
        });
        this.auth.socket.on("enable-answer-button-kd", () => {
          this.answerButtonDisabled = false;
          console.log("enable");
        });
      }
      this.auth.socket.on("update-3s-timer-kd", (time, ifPlayer) => {
        if (ifPlayer == true) {
          this.threeSecTimer2 = time;
        } else {
          this.threeSecTimer1 = time;
        }
      });
      this.auth.socket.on("stop-kd-sound", () => {
        this.sfxService.stopLoopingAudio();
      });
      this.auth.socket.on("update-kd-gamemode", (gamemode) => {
        this.gamemode = gamemode;
      });
      this.auth.socket.emit("get-kd-gamemode", (callback) => {
        this.gamemode = callback;
      });
    };
    this.auth.reconnect();

  }

  counter: number = 0;
  getAnswerTurn() {
    this.auth.socket.emit("get-turn-kd");
    console.log(this.currentTurn);
  }
  passQuestion() {}
}
