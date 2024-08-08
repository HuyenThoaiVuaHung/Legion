import { Component, computed, OnInit, Signal } from "@angular/core";
import { SfxService } from "../services/sfx-service.service";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-player-vcnv-answer",
  templateUrl: "./player-vcnv-answer.component.html",
  styleUrls: ["./player-vcnv-answer.component.scss"],
})
export class PlayerVcnvAnswerComponent implements OnInit {
  matchData: any = {};
  vcnvData: any = {};
  disabledCNVButton: boolean = false;
  constructor(private sfxService: SfxService, public auth: AuthService) {}

  ngOnInit(): void {
    this.sfxService.playSfx("VCNV_SHOWANS");
    this.auth.resetListeners();
    this.auth.socket.emit("get-vcnv-data", (callback) => {
      this.vcnvData = callback;
      if (this.vcnvData.disabledPlayers.includes(this.auth.userInfo().index!)) {
        this.disabledCNVButton = true;
      }
    });
    this.auth.socket.on("play-sfx", (sfx) => {
      this.sfxService.playSfx(sfx);
    });
    this.auth.socket.on("update-vcnv-data", (data) => {
      this.vcnvData = data;
      console.debug(this.auth.userInfo());
      if (this.vcnvData.disabledPlayers.includes(this.auth.userInfo().index!)) {
        this.disabledCNVButton = true;
      }
      if (this.vcnvData.showResults == true) {
        let counter = 0;
        this.vcnvData.playerAnswers.forEach((element) => {
          if (element.correct == true) {
            counter++;
          }
        });
        if (counter == 0) {
          this.sfxService.playSfx("VCNV_WRONG_ROW");
        } else {
          this.sfxService.playSfx("VCNV_CORRECT_ROW");
        }
      }
    });
  }

  attemptCNV() {
    this.auth.socket.emit("attempt-cnv-player", Date.now());
    this.auth.socket.emit("play-sfx", "VCNV_OBSTACLE");
    this.disabledCNVButton = true;
  }
}
