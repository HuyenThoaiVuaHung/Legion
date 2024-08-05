import { Component, OnInit } from "@angular/core";
import { SfxService } from "../services/sfx-service.service";
import { AuthService } from "../services/auth.service";
@Component({
  selector: "app-player-tangtoc-q",
  templateUrl: "./player-tangtoc-q.component.html",
  styleUrls: ["./player-tangtoc-q.component.scss"],
})
export class PlayerTangtocQComponent implements OnInit {
  constructor(private sfxService: SfxService, public auth: AuthService) {}
  imageSource = "";
  videoSource = "";
  ttData: any = {};
  disabledAnswerBox = true;
  currentTime: number = 0;
  curQuestion: any = {};
  highlightedVCNVQuestion: any = {};
  readableTime: string = "";
  answerCache: string = "";
  playerAnswer: string = "";
  audio: any = null;
  ngOnInit(): void {
    this.auth.socketHook = () => {
      this.auth.socket.on("play-sfx", (sfxID) => {
        this.sfxService.playSfx(sfxID);
      });
      if (this.auth.userInfo.roleId == 0) {
        this.auth.socket.emit("clear-answer-tt");
      }
      this.auth.socket.emit("get-tangtoc-data", (callback) => {
        this.ttData = callback;
      });

      this.auth.socket.on("update-tangtoc-data", (data) => {
        this.ttData = data;
        if (this.curQuestion.type == "TT_IMG") {
          if (this.ttData.showAnswer == true) {
            this.imageSource =
              "../../../assets/picture-questions/tt/" +
              this.ttData.questions[this.curQuestion.id - 1].answer_image;
          } else {
            this.imageSource =
              "../../../assets/picture-questions/tt/" +
              this.ttData.questions[this.curQuestion.id - 1].question_image;
          }
        }
      });
      this.auth.socket.on("update-clock", (clock) => {
        if (clock <= 0) {
          this.disabledAnswerBox = true;
          this.playerAnswer = "";
        } else {
          this.disabledAnswerBox = false;
        }
        this.currentTime = clock;
      });
      this.auth.socket.on("update-tangtoc-question", (question) => {
        if (question != undefined) {
          this.curQuestion = question;
          if (this.curQuestion.type == "TT_IMG") {
            if (this.ttData.showAnswer == true) {
              this.imageSource =
                "../../../assets/picture-questions/tt/" +
                this.ttData.questions[this.curQuestion.id - 1].answer_image;
            } else {
              this.imageSource =
                "../../../assets/picture-questions/tt/" +
                this.ttData.questions[this.curQuestion.id - 1].question_image;
            }
          } else if (this.curQuestion.type == "TT_VD") {
            this.videoSource =
              "../../../assets/video-questions/tt/" +
              this.ttData.questions[this.curQuestion.id - 1].video_name;
          }
        } else {
          this.curQuestion = {};
          this.imageSource = "";
          this.videoSource = "";
        }
      });
      this.auth.socket.on("tangtoc-play-video", () => {
        this.togglePlay();
      });
    };
    this.auth.reconnect();
  }

  togglePlay() {
    var myPlayer: HTMLVideoElement = document.getElementById(
      "video-1"
    ) as HTMLVideoElement;
    myPlayer.muted = true;
    if (myPlayer != null) {
      if (myPlayer.paused == true) {
        myPlayer.play();
      } else {
        myPlayer.pause();
      }
    }
  }
  submitAnswer() {
    if (this.currentTime > 0) {
      this.auth.socket.emit("player-submit-answer-tangtoc", this.playerAnswer);
      this.answerCache = this.playerAnswer;
      this.auth.socket.emit("");
      this.playerAnswer = "";
      this.getTimePassed(this.auth.userInfo.index!);
    }
  }
  getTimePassed(id: number) {
    setTimeout(() => {
      let timePassedinMs =
        this.ttData.playerAnswers[id].timestamp -
        this.ttData.timerStartTimestamp;
      this.readableTime =
        Math.trunc(timePassedinMs / 1000) +
        "s" +
        (timePassedinMs % 1000) +
        "ms";
    }, 200);
  }
  checkIfTime() {
    if (this.disabledAnswerBox == true) {
      this.playerAnswer = "";
    }
  }
}
