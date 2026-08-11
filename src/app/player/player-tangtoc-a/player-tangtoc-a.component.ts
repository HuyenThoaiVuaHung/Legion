import { Component, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { SfxService } from "src/app/services/sfx-service.service";
import { NgClass } from "@angular/common";
@Component({
    selector: "app-player-tangtoc-a",
    templateUrl: "./player-tangtoc-a.component.html",
    styleUrls: ["./player-tangtoc-a.component.scss"],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass]
})
export class PlayerTangtocAComponent implements OnInit {
  private sfxService = inject(SfxService);
  auth = inject(AuthService);

  ttData: any = {};
  ngOnInit(): void {
    this.auth.resetListeners();
    this.sfxService.playSfx("TT_SHOWANS");
    this.auth.socket.on("play-sfx", (sfxID) => {
      this.sfxService.playSfx(sfxID);
    });
    this.auth.socket.emit("get-tangtoc-data", (callback) => {
      this.ttData = callback;
      this.ttData.playerAnswers.sort(sortByTimestamp);
    });

    this.auth.socket.on("update-tangtoc-data", (data) => {
      this.ttData = data;
      this.ttData.playerAnswers.sort(sortByTimestamp);
      if (this.ttData.showResults == true) {
        let counter = 0;
        this.ttData.playerAnswers.forEach((element) => {
          if (element.correct == true) {
            counter++;
          }
        });
        if (counter == 0) {
          this.sfxService.playSfx("TT_WRONG");
        } else {
          this.sfxService.playSfx("TT_CORRECT");
        }
      }
    });
  }
  getTimePassed(id: number): string {
    let readableTime = "0s0ms";
    if (this.ttData.playerAnswers[id].timestamp > 0) {
      let timePassedinMs =
        this.ttData.playerAnswers[id].timestamp -
        this.ttData.timerStartTimestamp;
      readableTime =
        Math.trunc(timePassedinMs / 1000) +
        "s" +
        (timePassedinMs % 1000) +
        "ms";
    }
    return readableTime;
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
