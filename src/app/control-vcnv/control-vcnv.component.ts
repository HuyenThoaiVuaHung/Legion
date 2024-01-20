import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { io } from "socket.io-client";
import { environment } from "src/environments/environment";
import { FormPlayerComponent } from "../form-player/form-player.component";
import { FormQVcnvComponent } from "../form-q-vcnv/form-q-vcnv.component";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-control-vcnv",
  templateUrl: "./control-vcnv.component.html",
  styleUrls: ["./control-vcnv.component.scss"],
})
export class ControlVcnvComponent implements OnInit {
  ifPlayerCNV: boolean = true;
  constructor(
    public router: Router,
    public dialog: MatDialog,
    public auth: AuthService
  ) {}
  vcnvData: any = {};
  currentTime: number = 0;
  playerGetVCNV: any[] = [];
  displayingRow: any = {};
  chosenRow: any = {};
  vcnvMark: boolean[] = [];
  displayedQuestionColumns: string[] = [
    "id",
    "question",
    "answer",
    "type",
    "value",
    "action",
  ];
  displayedPlayerColumns: string[] = [
    "id",
    "name",
    "score",
    "response",
    "mark",
    "active",
  ];
  displayedVCNVPlayersColumns: string[] = ["id", "name", "mark", "time"];
  ngOnInit(): void {
    console.log("Logged in as admin");
    this.auth.resetListeners();
    if (
      this.auth.matchData.matchPos != "VCNV_Q" &&
      this.auth.matchData.matchPos != "VCNV_A"
    ) {
      this.auth.socket.emit("change-match-position", "VCNV_Q");
    }

    this.auth.socket.on("update-vcnv-data", (data) => {
      this.vcnvData = data;
    });
    this.auth.socket.on("update-clock", (clock) => {
      this.currentTime = clock;
    });
    this.auth.socket.emit("get-vcnv-data", (callback) => {
      this.vcnvData = callback;
      if (this.vcnvData.showResults == true) {
        this.toggleResultsDisplay();
      }
    });
    this.auth.socket.on("player-vcnv-get", (player) => {
      this.playerGetVCNV.push(player);
    });
  }
  playSfx(sfxId: string) {
    this.auth.socket.emit("play-sfx", sfxId);
  }
  onDoubleClickPlayer(row: any) {
    let player = this.auth.matchData.players[this.auth.matchData.players.indexOf(row)];
    const dialogRef = this.dialog.open(FormPlayerComponent, {
      data: player,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        var payload: any = {
          player: result,
          index: this.auth.matchData.players.indexOf(row),
        };
        payload.player.score = parseInt(payload.player.score);
        this.auth.socket.emit("edit-player-info", payload, (callback) => {});
      }
    });
  }
  editQuestion() {
    let question =
      this.vcnvData.questions[this.vcnvData.questions.indexOf(this.chosenRow)];
    const dialogRef = this.dialog.open(FormQVcnvComponent, {
      data: question,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        var payload: any = {
          question: result,
          index: this.vcnvData.questions.indexOf(this.chosenRow),
        };
        payload.question.value = parseInt(payload.question.value);
        this.vcnvData.questions[
          this.vcnvData.questions.indexOf(this.chosenRow)
        ] = payload.question;
        this.auth.socket.emit("update-vcnv-data", this.vcnvData);
      }
    });
  }
  submitMark() {
    this.auth.socket.emit("submit-mark-vcnv-admin", this.vcnvData.playerAnswers);
  }
  onClickQuestion(row) {
    this.chosenRow = row;
  }
  onDoubleClickQuestion(row) {
    this.displayingRow = row;
    this.auth.socket.emit("play-sfx", "VCNV_CHOOSE_ROW");
    this.auth.socket.emit("highlight-vcnv-question", row.id, (callback) => {});
  }
  openHN(id: number) {
    this.auth.socket.emit("open-hn-vcnv", id);
  }
  resetCNVPlayers() {
    this.vcnvData.CNVPlayers = [];
    this.vcnvData.disabledPlayers = [];
    this.auth.socket.emit("update-vcnv-data", this.vcnvData);
  }
  showQuestion() {
    this.auth.socket.emit("broadcast-vcnv-question", this.displayingRow.id);
    this.vcnvData.questions[this.displayingRow.id - 1].ifShown = true;
    this.auth.socket.emit("update-vcnv-data", this.vcnvData);
  }
  toggleIfShown() {
    this.auth.socket.emit("update-vcnv-data", this.vcnvData);
  }
  hideQuestion() {
    this.auth.socket.emit("broadcast-vcnv-question", 7);
  }
  closeHN(id: number) {
    this.auth.socket.emit("close-hn-vcnv", id);
  }
  start15sTimer() {
    this.auth.socket.emit("start-clock", 15);
  }
  toggleResultsDisplay() {
    this.auth.socket.emit("toggle-results-display-vcnv");
  }
  toggleAnswerDisplay() {
    if (this.auth.matchData.matchPos == "VCNV_Q") {
      this.auth.socket.emit("change-match-position", "VCNV_A");
    } else if (this.auth.matchData.matchPos == "VCNV_A") {
      this.auth.socket.emit("change-match-position", "VCNV_Q");
      if (this.vcnvData.showResults == true) {
        this.toggleResultsDisplay();
      }
    }
  }
  submitVCNVMark() {
    let ifAnswerCorrect: boolean = false;
    for (let i = 0; i < this.vcnvMark.length; i++) {
      if (this.vcnvMark[i] == true) ifAnswerCorrect = true;
    }
    this.auth.socket.emit("submit-cnv-mark", this.vcnvMark);
    if (ifAnswerCorrect) {
      this.playSfx("VCNV_OBSTACLE_CORRECT");
      this.auth.socket.emit("open-hn-vcnv", 1);
      this.auth.socket.emit("open-hn-vcnv", 2);
      this.auth.socket.emit("open-hn-vcnv", 3);
      this.auth.socket.emit("open-hn-vcnv", 4);
      this.auth.socket.emit("open-hn-vcnv", 5);
    } else {
      this.playSfx("VCNV_WRONG_ROW");
    }
  }
  moveToTT() {
    this.router.navigate(["/c-tt"]);
  }
  showPoints() {
    if (this.auth.matchData.matchPos == "PNTS") {
      this.auth.socket.emit("change-match-position", "VCNV_Q");
    } else {
      this.auth.socket.emit("change-match-position", "PNTS");
    }
  }
}
