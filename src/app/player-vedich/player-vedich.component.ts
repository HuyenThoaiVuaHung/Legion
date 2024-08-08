import { Component, OnInit } from "@angular/core";
import { SfxService } from "../services/sfx-service.service";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-player-vedich",
  templateUrl: "./player-vedich.component.html",
  styleUrls: ["./player-vedich.component.scss"],
})
export class PlayerVedichComponent implements OnInit {
  constructor(private sfxService: SfxService, public auth: AuthService) {}
  videoSource = "";
  imgSource = "";
  vdData: any = {};
  public maxTime = 0;
  currentTime: number = 0;
  stealingPlayerIndex: number = -1;
  fiveSecTimer: number = 0;
  curQuestion: any = {};
  buttonDisabled: boolean = true;
  audio: any = null;
  ngOnInit(): void {
    this.auth.resetListeners();
    this.auth.socket.on("play-sfx", (sfxID) => {
      this.sfxService.playSfx(sfxID);
    });
    this.auth.socket.emit("get-vedich-data", (callback) => {
      this.vdData = callback;
    });
    this.auth.socket.on("update-vedich-data", (data) => {
      this.vdData = data;
    });
    this.auth.socket.on("update-vedich-question", (question) => {
      if (question != undefined) {
        this.curQuestion = question;
        console.debug(this.curQuestion);
        if (this.audio != null) {
          this.audio.pause();
          this.audio = null;
        }
        if (this.curQuestion.type == "V") {
          this.videoSource =
            "../../../assets/video-questions/vd/" + this.curQuestion.file_name;
        } else if (this.curQuestion.type == "A") {
          this.audio = new Audio(
            "../../../assets/audio-questions/vd/" + this.curQuestion.file_name
          );
          this.audio.load();
          this.audio.play();
        } else if (this.curQuestion.type == "I") {
          this.imgSource =
            "../../../assets/picture-questions/vd/" +
            this.curQuestion.file_name;
        } else {
          this.videoSource = "";
          this.imgSource = "";
        }
      } else {
        this.curQuestion = {};
        this.videoSource = "";
      }
    });
    this.auth.socket.on("update-clock", (clock) => {
      if (this.currentTime == 0) {
        console.debug(this.maxTime);
        this.maxTime = clock;
      }

      this.currentTime = clock;
    });
    this.auth.socket.on("vd-play-video", () => {
      const video: HTMLVideoElement = document.getElementById(
        "vedich-video"
      ) as HTMLVideoElement;
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });
    this.auth.socket.on("unlock-button-vd", () => {
      this.buttonDisabled = false;
    });
    this.auth.socket.on("lock-button-vd", () => {
      this.buttonDisabled = true;
    });

    this.auth.socket.on("update-5s-countdown-vd", (counter) => {
      this.fiveSecTimer = counter;
    });
    this.auth.socket.on("player-steal-question", (id) => {
      this.stealingPlayerIndex = id;
    });
    this.auth.socket.on("clear-stealing-player", () => {
      this.stealingPlayerIndex = -1;
    });
  }
  stealQuestion() {
    this.auth.socket.emit("player-steal-question");
  }
}
