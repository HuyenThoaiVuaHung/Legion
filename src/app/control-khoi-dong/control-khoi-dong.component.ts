import { Component, OnInit } from "@angular/core";
import * as io from "socket.io-client";
import { Router } from "@angular/router";
import { FormQKdComponent } from "../form-q-kd/form-q-kd.component";
import { MatDialog } from "@angular/material/dialog";
import { FormPlayerComponent } from "../form-player/form-player.component";
import { environment } from "src/environments/environment";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-control-khoi-dong",
  templateUrl: "./control-khoi-dong.component.html",
  styleUrls: ["./control-khoi-dong.component.scss"],
})
export class ControlKhoiDongComponent implements OnInit {
  constructor(
    private router: Router,
    public dialog: MatDialog,
    private auth: AuthService
  ) { }
  displayingRow: any = null;
  chosenRow: any = null;
  currentTime: number = 0;
  displayedQuestionColumns: string[] = [
    "question",
    "answer",
    "type",
    "subject",
  ];
  displayedPlayerColumns: string[] = ["id", "name", "score", "active"];
  authString: string = "";
  currentMaxQuestionNo: number = 0;
  currentQuestionNo: number = 0;
  matchData: any = {};
  kdData: any = {};
  chosenPlayer: any = {};
  currentQuestionCount: number = 0;
  lastTurn: any = { name: "" };
  threeSecTimers: number[] = [0, 0];
  async ngOnInit(): Promise<void> {
    this.auth.resetListeners();
    this.auth.socket.emit("change-match-position", "KD");
    this.auth.matchData = this.auth.matchData;
    this.auth.socket.on("update-match-data", (data) => {
      this.matchData = data;
    });
    this.auth.socket.on("update-kd-data-admin", (data) => {
      this.kdData = data;
    });
    this.auth.socket.on("update-number-question", (max, curr) => {
      this.currentMaxQuestionNo = max;
      this.currentQuestionNo = curr;
    });
    this.auth.socket.on("update-clock", (clock) => {
      this.currentTime = clock;
    });
    this.auth.socket.emit("get-kd-data-admin", (callback: any) => {
      console.log(this.auth.socket.id)
      this.kdData = callback;
    });
    this.auth.socket.on("disconnect", () => {
      this.auth.socket.emit("leave-match", this.authString);
    });
    this.auth.socket.on("player-got-turn-kd", (player) => {
      this.lastTurn = player;
    });
    this.auth.socket.on("next-question", () => {
      this.nextQuestion();
      this.lastTurn.name = "";
    });
    this.auth.socket.on("update-3s-timer-kd", (timer, ifPlayer) => {
      if (ifPlayer) {
        this.threeSecTimers[1] = timer;
      } else {
        this.threeSecTimers[0] = timer;
      }
    });
  }
  onClickQuestion(row: any) {
    this.chosenRow = row;
  }
  onDoubleClickQuestion(row: any) {
    this.displayingRow = row;
    this.auth.socket.emit("broadcast-kd-question", row, (callback: { message: any; }) => {
      console.log(callback.message);
    });
  }
  editPlayer() {
    let player =
      this.matchData.players[this.matchData.players.indexOf(this.chosenPlayer)];
    const dialogRef = this.dialog.open(FormPlayerComponent, {
      data: player,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        var payload: any = {
          player: result,
          index: this.matchData.players.indexOf(this.chosenPlayer),
        };
        payload.player.score = parseInt(payload.player.score);
        this.auth.socket.emit("edit-player-info", payload, (callback: { message: any; }) => {
          console.log(callback.message);
        });
      }
    });
  }
  onDoubleClickPlayer(row: any) {
    this.auth.socket.emit("change-singleplayer-kd-turn", row.id);
  }
  onGamemodeChange($event: any) {
    this.auth.socket.emit("change-kd-gamemode", this.kdData.gamemode);
  }
  editQuestion() {
    let question =
      this.kdData.questions[this.kdData.questions.indexOf(this.chosenRow)];
    const dialogRef = this.dialog.open(FormQKdComponent, {
      data: question,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        var payload: any = {
          question: result,
          index: this.kdData.questions.indexOf(this.chosenRow),
        };
        this.auth.socket.emit("edit-kd-question", payload, (callback: { message: any; }) => {
          console.log(callback.message);
        });
      }
    });
  }
  choosePlayer(row: any) {
    this.chosenPlayer = row;
  }
  playSfx(sfxId: string, loop?: boolean) {
    this.auth.socket.emit("play-sfx", sfxId, loop);
  }
  roundStart(amount: number) {
    this.auth.socket.emit("start-turn-kd", amount);
    this.currentMaxQuestionNo = amount;
    this.currentQuestionNo = 0;
    this.currentQuestionCount = 0;
    this.playSfx("KD_60S", true);
    this.nextQuestion();
  }
  clockPause() {
    this.auth.socket.emit("play-pause-clock");
  }
  start3sTimer() {
    if (this.lastTurn.name != "") {
      this.auth.socket.emit("start-3s-timer-kd", true);
    } else {
      this.auth.socket.emit("start-3s-timer-kd", false);
    }
  }
  goToVCNV() {
    this.router.navigate(["/c-vcnv"]);
  }
  resetTurn() {
    this.auth.socket.emit("clear-turn-kd");
    this.lastTurn = {};
  }
  markCorrect() {
    if (this.lastTurn.name != "" || this.kdData.gamemode == "S") {
      this.auth.socket.emit("correct-mark-kd");
      this.auth.socket.emit("stop-3s-timer-kd");
      this.playSfx("KD_CORRECT");
      this.auth.socket.emit("clear-turn-kd");
      this.nextQuestion();
      this.lastTurn.name = "";
    }
  }
  markWrong() {
    if (this.lastTurn.name != "" || this.kdData.gamemode == "S") {
      this.auth.socket.emit("stop-3s-timer-kd");
      this.auth.socket.emit("wrong-mark-kd");
      this.playSfx("KD_WRONG");
      this.auth.socket.emit("clear-turn-kd");
      this.nextQuestion();
      this.lastTurn.name = "";
    }
  }
  nextQuestion() {
    console.log(this.currentQuestionCount);
    console.log(this.currentMaxQuestionNo);
    if (this.currentQuestionCount < this.currentMaxQuestionNo) {
      // this.displayingRow = this.kdData.questions[this.kdData.questions[this.kdData.gamemode == 'S'].indexOf(this.displayingRow) + 1];
      this.displayingRow =
        this.kdData.gamemode == "S"
          ? this.kdData.questions.singleplayer[
          this.kdData.currentSingleplayerPlayer
          ][this.currentQuestionCount]
          : this.kdData.questions.multiplayer[this.currentQuestionCount];
      this.auth.socket.emit(
        "broadcast-kd-question",
        this.displayingRow,
        (callback: { message: any; }) => {
          console.log(callback.message);
        }
      );
      this.currentQuestionCount += 1;
    } else {
      this.auth.socket.emit("stop-kd-sound");
      console.log("Last question reached");
    }
  }
  clearQuestion() {
    this.auth.socket.emit("clear-question-kd");
  }
  showPoints() {
    if (this.matchData.matchPos == "PNTS") {
      this.auth.socket.emit("change-match-position", "KD");
    } else {
      this.auth.socket.emit("change-match-position", "PNTS");
    }
  }
}
