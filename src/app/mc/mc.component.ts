import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { TtData, VcnvData, VdData } from "../services/types/game";
import { Player } from "../services/types/match.data";

@Component({
  selector: "app-mc",
  templateUrl: "./mc.component.html",
  styleUrls: ["./mc.component.scss"],
})
export class McComponent implements OnInit {
  constructor(public router: Router, public auth: AuthService) {}
  question: any = {};
  currentTime: number = 0;
  maxTime: number = 0;
  vdData?: VdData;
  vcnvData?: VcnvData;
  threeSecTimer1: number = 0;
  threeSecTimer2: number = 0;
  ttData?: TtData;
  kdTurn: any = {};
  imagePath: string = "../../../assets/images/";
  stealingPlayerIndex: number = -1;
  answerCache: string = "";
  ngOnInit(): void {
    this.auth.resetListeners();
    this.auth.socket.on("update-kd-question", (data) => {
      this.answerCache = this.question.answer;
      this.question = data;
    });
    this.auth.socket.on("update-clock", (clock) => {
      if (this.currentTime == 0) {
        this.maxTime = clock;
      }

      this.currentTime = clock;
    });
    this.auth.socket.on("player-got-turn-kd", (player) => {
      this.kdTurn = player;
    });
    this.auth.socket.on("player-steal-question", (id) => {
      this.stealingPlayerIndex = id;
    });
    this.auth.socket.emit("get-vcnv-data", (callback: VcnvData) => {
      this.vcnvData = callback;
      this.imagePath =
        "../../../assets/picture-questions/vcnv/" +
        this.vcnvData.questions[5].picFileName;
    });
    this.auth.socket.emit("get-vedich-data", (callback: VdData) => {
      this.vdData = callback;
    });
    this.auth.socket.on("clear-turn-player-kd", () => {
      this.kdTurn = {};
    });
    this.auth.socket.emit("get-tangtoc-data", (callback: TtData) => {
      this.ttData = callback;
    });
    this.auth.socket.on("next-question", () => {
      this.kdTurn = 0;
    });
    this.auth.socket.on("update-vcnv-question", (question) => {
      this.question = question;
    });
    this.auth.socket.on("update-tangtoc-question", (question) => {
      this.question = question;
    });
    this.auth.socket.on("update-3s-timer-kd", (time, ifPlayer) => {
      if (ifPlayer == true) {
        this.threeSecTimer2 = time;
      } else {
        this.threeSecTimer1 = time;
      }
    });
    this.auth.socket.on("update-vedich-question", (question) => {
      this.question = question;
    });
    this.auth.socket.on("clear-stealing-player", () => {
      this.stealingPlayerIndex = -1;
    });
    this.auth.socket.on("update-vcnv-data", (data: VcnvData) => {
      this.vcnvData = data;
      this.imagePath =
        "../../../assets/picture-questions/vcnv/" +
        this.vcnvData.questions[5].picFileName;
    });
    this.auth.socket.on("update-vedich-data", (data) => {
      this.vdData = data;
    });
    this.auth.socket.on("update-tangtoc-data", (data: TtData) => {
      this.ttData = data;
      this.ttData.playerAnswers.sort(sortByTimestamp);
    });
  }

  resolveCnvPlayers(cnvPlayers): Player[] {
    return cnvPlayers.map((player) => this.auth.matchData().players[player.id]);
  }
  counter: number = 0;
  getAnswerTurn() {
    this.auth.socket.emit("get-turn-kd");
    this.auth.socket.emit("start-3s-timer-kd", true);
  }
  passQuestion() {}
  getTimePassed(id: number): string {
    let readableTime = "0s0ms";
    if (this.ttData!.playerAnswers[id].timestamp > 0) {
      let timePassedinMs =
        this.ttData!.playerAnswers[id].timestamp -
        this.ttData!.timerStartTimestamp;
      readableTime =
        Math.trunc(timePassedinMs / 1000) +
        "s" +
        (timePassedinMs % 1000) +
        "ms";
    }
    return readableTime;
  }
  public getVcnvAnswerLength(index: number) {
    return this.vcnvData!.questions[index].answer.replace(/\s+/, '').length;
  }
}

function sortByTimestamp(a, b) {
  if (a.timestamp < b.timestamp) {
    return -1;
  }
  if (a.timestamp > b.timestamp) {
    return 1;
  }
  return 0;
}
