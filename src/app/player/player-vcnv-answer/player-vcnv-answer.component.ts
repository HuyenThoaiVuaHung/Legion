import { Component, computed, OnInit, Signal, ChangeDetectionStrategy, inject } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { SfxService } from "src/app/services/sfx-service.service";
import { NgClass } from "@angular/common";
import { MatFabButton } from "@angular/material/button";

@Component({
    selector: "app-player-vcnv-answer",
    templateUrl: "./player-vcnv-answer.component.html",
    styleUrls: ["./player-vcnv-answer.component.scss"],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass, MatFabButton]
})
export class PlayerVcnvAnswerComponent implements OnInit {
  private sfxService = inject(SfxService);
  auth = inject(AuthService);

  matchData: any = {};
  vcnvData: any = {};
  disabledCNVButton: boolean = false;

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
