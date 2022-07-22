import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { SfxService } from '../services/sfx-service.service';

@Component({
  selector: 'app-player-chp',
  templateUrl: './player-chp.component.html',
  styleUrls: ['./player-chp.component.scss']
})
export class PlayerChpComponent implements OnInit {

  socket = io(environment.socketIp);
  answerButtonDisabled = true;
  constructor(
    public router: Router,
    private sfxService: SfxService
  ) { }
  question: any = {};
  time: number = 0;
  matchData: any = {};
  chpData: any = {};
  audio: any = null;
  playerIndex: number = -1;
  roleId: number = -1;
  currentTurn: number = -1;
  ifGotTurn: boolean = false;
  ngOnInit(): void {
    this.socket.emit('init-authenticate', localStorage.getItem('authString'), (callback) => {
      if (callback.roleId == 0 || callback.roleId == 3) {
        this.matchData = callback.matchData;
        this.roleId = callback.roleId;
        console.log(this.matchData.matchPos);
        this.socket.emit('get-chp-data', (data) => {
          this.chpData = data;
        })
        if (this.matchData.matchPos != 'CHP') {
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
        this.socket.on('play-sfx', (sfxID) => {
          this.sfxService.playSfx(sfxID);
        })
        console.log('Logged in as player');
        this.socket.on('update-chp-question', (data) => {
          this.question = data;
        })
        this.socket.on('got-turn-chp', (data) => {
          if (this.playerIndex == data) {
            this.ifGotTurn = true;
          }
          this.currentTurn = data;
        })
        this.socket.on('clear-turn-chp', () =>{
          this.currentTurn = -1;
          this.ifGotTurn = false;
        })
        if (this.roleId == 0) {
          this.playerIndex = callback.playerIndex;
          this.socket.on('unlock-button-chp', () => {
            this.answerButtonDisabled = false;
          })
          this.socket.on('lock-button-chp', () => {
            this.answerButtonDisabled = true;
          });
        }
        this.socket.on('update-clock', (clock) => {
          this.time = clock;
        })
        this.socket.on('update-chp-data', (data) => {
          this.chpData = data;
        })
        this.socket.on('update-match-data', (matchData) => {
          this.matchData = matchData;
          if (matchData.matchPos != 'CHP') {
            switch (matchData.matchPos) {
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
        })
      }
      else {
        console.log('Wrong token/Wrong match position');
        this.router.navigate(['/']);
      }
    });
  }
  getAnswerTurn() {
    this.socket.emit('get-turn-chp');
  }


}
