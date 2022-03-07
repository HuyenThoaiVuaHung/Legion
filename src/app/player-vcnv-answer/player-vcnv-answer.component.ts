import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { SfxService } from '../services/sfx-service.service';

@Component({
  selector: 'app-player-vcnv-answer',
  templateUrl: './player-vcnv-answer.component.html',
  styleUrls: ['./player-vcnv-answer.component.scss']
})
export class PlayerVcnvAnswerComponent implements OnInit {
  socket = io(environment.socketIp);
  matchData: any = {};
  vcnvData: any = {};
  playerIndex: number = -1;
  roleId: number = -1;
  disabledCNVButton: boolean = false;
  constructor(
    private router: Router,
    private sfxService: SfxService
  ) { }
  ngOnInit(): void {
    this.socket.emit('init-authenticate', localStorage.getItem('authString'), (callback) => {
      this.matchData = callback.matchData;
      this.playerIndex = callback.playerIndex;
      this.roleId = callback.roleId;
      this.sfxService.playSfx('VCNV_SHOWANS');
      if (callback.roleId == 0 || callback.roleId == 3) {
        console.log('Logged in as player');
        if (this.matchData.matchPos != 'VCNV_A') {
          switch (this.matchData.matchPos) {
            case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']);
              break;
            case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']);
              break;
            case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']);
              break;
            case 'TT_A': this.router.navigate(['/pl-tangtoc-a']);
              break;
            case 'VD': this.router.navigate(['pl-vd']);
              break;
            case 'H': this.router.navigate(['']);
              break;
            case 'PNTS': this.router.navigate(['/pnts']);
              break;
            case 'KD': this.router.navigate(['/pl-kd']);
          }
          this.socket.close();
        }
        this.socket.emit('get-vcnv-data', (callback) => {
          this.vcnvData = callback;
          if (this.vcnvData.disabledPlayers.includes(this.playerIndex)) {
            this.disabledCNVButton = true;
          }
        });
        this.socket.on('update-match-data', (data) => {
          console.log('Match data updated');
          this.matchData = data;
          if (this.matchData.matchPos != 'VCNV_A') {
            switch (this.matchData.matchPos) {
              case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']);
                break;
              case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']);
                break;
              case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']);
                break;
              case 'TT_A': this.router.navigate(['/pl-tangtoc-a']);
                break;
              case 'VD': this.router.navigate(['pl-vd']);
                break;
              case 'H': this.router.navigate(['']);
                break;
              case 'PNTS': this.router.navigate(['/pnts']);
                break;
              case 'KD': this.router.navigate(['/pl-kd']);
            }
            this.socket.close();
          }
        });
        this.socket.on('play-sfx', (sfx) => {
          this.sfxService.playSfx(sfx);
        })
        this.socket.on('update-vcnv-data', (data) => {
          this.vcnvData = data;
          if (this.vcnvData.disabledPlayers.includes(this.playerIndex)) {
            this.disabledCNVButton = true;
          }
          if (this.vcnvData.showResults == true) {
            let counter = 0;
            this.vcnvData.playerAnswers.forEach(element => {
              if (element.correct == true) {
                counter++;
              }
            });
            if (counter == 0) {
              this.sfxService.playSfx('VCNV_WRONG_ROW');
            }
            else {
              this.sfxService.playSfx('VCNV_CORRECT_ROW');
            }
          }
        });
      }
    });
  }
  attemptCNV() {
    this.socket.emit('attempt-cnv-player', Date.now());
    this.socket.emit('play-sfx', 'VCNV_OBSTACLE');
    this.disabledCNVButton = true;
  }

}
