import { Component, OnInit } from "@angular/core";
import { SfxService } from "../services/sfx-service.service";
import { AuthService } from "../services/auth.service";
import { VcnvData } from "../types/game";

@Component({
  selector: "app-player-vcnv-question",
  templateUrl: "./player-vcnv-question.component.html",
  styleUrls: ["./player-vcnv-question.component.scss"],
})
export class PlayerVcnvQuestionComponent implements OnInit {
  constructor(private sfxService: SfxService, public auth: AuthService) {}
  vcnvData: VcnvData = {} as VcnvData;
  currentTime: number = 0;
  curVCNVQuestion: any = {};
  highlightedVCNVQuestion: any = {};
  VCNVStrings: string[] = [];
  answerCache: string = "";
  playerAnswer: string = "";
  disabledCNVButton: boolean = false;
  audio: any = null;

  async ngOnInit() {
    this.auth.resetListeners();
    this.auth.socket.emit("clear-player-answer");
    this.auth.socket.on("play-sfx", (sfx) => {
      this.sfxService.playSfx(sfx);
    });
    this.auth.socket.on("update-vcnv-data", (data) => {
      this.vcnvData = data;
      if (this.vcnvData.disabledPlayers.includes(this.auth.userInfo().index!)) {
        this.disabledCNVButton = true;
      } else {
        this.disabledCNVButton = false;
      }
      try {
        this.formatStrings();
      } catch (error) {
        console.debug(error);
        this.VCNVStrings = [];
      }
    });

    this.auth.socket.on("update-clock", (clock) => {
      this.currentTime = clock;
    });
    this.auth.socket.emit("get-vcnv-data", (callback: VcnvData) => {
      console.debug(callback);
      this.vcnvData = callback;
      if (this.vcnvData.disabledPlayers.includes(this.auth.userInfo().index!)) {
        this.disabledCNVButton = true;
      } else {
        this.disabledCNVButton = false;
      }
      try {
        this.formatStrings();
      } catch (error) {
        console.debug(error);
        this.VCNVStrings = [];
      }
    });
    this.auth.socket.on("update-highlighted-vcnv-question", (index) => {
      this.highlightedVCNVQuestion = this.vcnvData.questions[index - 1];
    });
    this.auth.socket.on("update-vcnv-question", (data) => {
      this.curVCNVQuestion = data;
      if (this.curVCNVQuestion.type == "HN_S") {
        this.audio = new Audio(
          "../../../assets/audio-questions/vcnv/" +
            this.curVCNVQuestion.audioFilePath
        );
        this.audio.play();
      } else if (this.audio != null) {
        this.audio.pause();
      }
    });
    this.setCnvImage();
  }
  async setCnvImage() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    document.getElementById("cnvPicBox")!.style.backgroundImage =
      "url(../../../assets/picture-questions/vcnv/" +
      this.vcnvData.questions[5].picFileName +
      ")";
  }
  formatStrings() {
    for (let i: number = 0; i <= 5; i++) {
      this.VCNVStrings[i] = this.vcnvData.questions[i].answer;
    }
    this.VCNVStrings.forEach((element, index) => {
      element = element.toString();
      element = element.replace(/\s/g, "");
      element = element.toUpperCase();
      if (
        this.vcnvData.questions[index].ifOpen == false &&
        this.vcnvData.questions[index].ifShown == false
      ) {
        let processedString = "";
        for (let i = 0; i < element.length; i++) {
          processedString += "◯";
        }
        element = processedString;
      } else if (
        this.vcnvData.questions[index].ifOpen == false &&
        this.vcnvData.questions[index].ifShown == true
      ) {
        let processedString = "";
        for (let i = 0; i < element.length; i++) {
          processedString += "⬤";
        }
        element = processedString;
      }
      this.VCNVStrings[index] = element;
    });
  }
  submitAnswer() {
    if (this.currentTime > 0) {
      this.answerCache = this.playerAnswer.toUpperCase();
      this.auth.socket.emit("submit-answer-vcnv", this.playerAnswer);
      this.playerAnswer = "";
    }
  }
  attemptVCNV() {
    this.auth.socket.emit("attempt-cnv-player", Date.now());
    this.auth.socket.emit("play-sfx", "VCNV_OBSTACLE");
    this.disabledCNVButton = true;
  }
  checkIfTime() {
    if (this.currentTime <= 0) {
      this.playerAnswer = "";
    }
  }
}
