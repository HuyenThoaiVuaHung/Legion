import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { SfxService } from '../services/sfx-service.service';

@Component({
  selector: 'app-player-vedich',
  templateUrl: './player-vedich.component.html',
  styleUrls: ['./player-vedich.component.scss']
})
export class PlayerVedichComponent implements OnInit {
  socket = io(environment.socketIp);
  constructor(private router: Router,
    private sfxService: SfxService) { }
  videoSource = '';
  imgSource = '';
  vdData: any = {};
  roleId: number = -1;
  matchData: any = {};
  currentTime: number = 0;
  stealingPlayerIndex: number = -1;
  fiveSecTimer: number = 0;
  curQuestion: any = {};
  buttonDisabled: boolean = true;
  playerIndex: number = 0;
  audio: any = null;
  ngOnInit(): void {
    this.socket.emit('init-authenticate', localStorage.getItem('authString'), (callback) => {
      this.matchData = callback.matchData;
      this.playerIndex = callback.playerIndex
      this.roleId = callback.roleId;
      if (callback.roleId == 0 || callback.roleId == 3) {
        if (this.matchData.matchPos != 'VD') {
          switch (this.matchData.matchPos) {
            case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']);
              break;
            case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']);
              break;
            case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']);
              break;
            case 'TT_A': this.router.navigate(['/pl-tangtoc-a']);
              break;
            case 'CHP': this.router.navigate(['pl-chp']);
              break;
            case 'H': this.router.navigate(['']);
              break;
            case 'PNTS': this.router.navigate(['/pnts']);
              break;
            case 'KD': this.router.navigate(['/pl-kd']);
          }
          this.socket.close();
        } this.socket.on('play-sfx', (sfxID) => {
          this.sfxService.playSfx(sfxID);
        })
        this.socket.on('update-match-data', (data) => {
          this.matchData = data;
          if (this.matchData.matchPos != 'VD') {
            switch (this.matchData.matchPos) {
              case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']);
                break;
              case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']);
                break;
              case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']);
                break;
              case 'TT_A': this.router.navigate(['/pl-tangtoc-a']);
                break;
              case 'CHP': this.router.navigate(['pl-chp']);
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
        this.socket.emit('get-vedich-data', (callback) => {
          this.vdData = callback;
        });
        this.socket.on('update-vedich-data', (data) => {
          this.vdData = data;
        });
        this.socket.on('update-vedich-question', (question) => {
          if (question != undefined) {
            this.curQuestion = question;
            console.log(this.curQuestion);
            if (this.audio != null) {
              this.audio.pause();
              this.audio = null;
            }
            if (this.curQuestion.type == 'V') {
              this.videoSource = "../../../assets/video-questions/vd/" + this.curQuestion.file_name;
            }
            else if (this.curQuestion.type == 'A') {
              this.audio = new Audio('../../../assets/audio-questions/vd/' + this.curQuestion.file_name);
              this.audio.load();
              this.audio.play();
            }
            else if (this.curQuestion.type == 'I') {
              this.imgSource = "../../../assets/picture-questions/vd/" + this.curQuestion.file_name;
            }
            else {
              this.videoSource = "";
              this.imgSource = "";
            }
          }
          else {
            this.curQuestion = {};
            this.videoSource = '';
          }
        });
        this.socket.on('update-clock', (clock) => {
          this.currentTime = clock;
        })
        this.socket.on('vd-play-video', () => {
          let video: HTMLVideoElement = document.getElementById('vedich-video') as HTMLVideoElement;
          if (video.paused) {
            video.play();
          }
          else {
            video.pause();
          }
        });
        if (this.roleId == 0) {
          this.socket.on('unlock-button-vd', () => {
            this.buttonDisabled = false;
          });
          this.socket.on('lock-button-vd', () => {
            this.buttonDisabled = true;
          });
        }

        this.socket.on('update-5s-countdown-vd', (counter) => {
          this.fiveSecTimer = counter;
        });
        this.socket.on('player-steal-question', (id) => {
          this.stealingPlayerIndex = id;
        });
        this.socket.on('clear-stealing-player', () => {
          this.stealingPlayerIndex = -1;
        })
      }
    });
  }
  stealQuestion() {
    this.socket.emit('player-steal-question');
  }
}
