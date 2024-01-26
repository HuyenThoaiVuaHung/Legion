import { Component, OnInit } from '@angular/core';
import { SfxService } from '../services/sfx-service.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-player-tangtoc-a',
  templateUrl: './player-tangtoc-a.component.html',
  styleUrls: ['./player-tangtoc-a.component.scss']
})
export class PlayerTangtocAComponent implements OnInit {

  ttData: any = {};
  constructor(
    private sfxService: SfxService,
    public auth: AuthService
  ) { }
  ngOnInit(): void {
    this.auth.resetListeners();
    this.sfxService.playSfx('TT_SHOWANS');
    this.auth.socket.on('play-sfx', (sfxID) => {
      this.sfxService.playSfx(sfxID);
    })
    this.auth.socket.emit('get-tangtoc-data', (callback) => {
      this.ttData = callback;
      this.ttData.playerAnswers.sort(sortByTimestamp);
    });

    this.auth.socket.on('update-tangtoc-data', (data) => {
      this.ttData = data;
      this.ttData.playerAnswers.sort(sortByTimestamp);
      if (this.ttData.showResults == true) {
        let counter = 0;
        this.ttData.playerAnswers.forEach(element => {
          if (element.correct == true) {
            counter++;
          }
        });
        if (counter == 0) {
          this.sfxService.playSfx('TT_WRONG');
        }
        else {
          this.sfxService.playSfx('TT_CORRECT');
        }
      }
    });
  }
  getTimePassed(id: number): string {
    let readableTime = '0s0ms';
    if (this.ttData.playerAnswers[id].timestamp > 0) {
      let timePassedinMs = this.ttData.playerAnswers[id].timestamp - this.ttData.timerStartTimestamp;
      readableTime = Math.trunc(timePassedinMs / 1000) + 's' + timePassedinMs % 1000 + 'ms';
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
