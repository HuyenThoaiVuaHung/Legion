import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-player-khoi-dong',
  templateUrl: './player-khoi-dong.component.html',
  styleUrls: ['./player-khoi-dong.component.scss']
})
export class PlayerKhoiDongComponent implements OnInit {
  socket = io.connect(environment.socketIp);
  answerButtonDisabled = false;
  constructor(
    public router: Router
  ) {}
  question: any = {};
  time: number = 0;
  player: any = {};
  threeSecTimer: number = 0;
  audio: any = null;
  picturePath: string = '';
  questionObservable = new Observable((observer) => {
    this.socket.on('update-kd-question', (data) => {
      this.answerCache = this.question.answer;
      observer.next(data);
    });
  });
  answerCache: string = '';
  ngOnInit(): void {
    this.socket.emit('init-authenticate', localStorage.getItem('authString'), (callback) => {
      if(callback.roleId == 0){
        switch(callback.matchData.matchPos){
          case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']); break;
          case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']); break;
          case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']); break;
          case 'TT_A': this.router.navigate(['/pl-tangtoc-a']); break;
          case 'VD': this.router.navigate(['pl-vd']); break;
        }
        console.log('Logged in as player');
        this.player = callback.player;
        this.questionObservable.subscribe((data) => {
          this.question = data;
          if (this.audio != null){
            this.audio.pause();
          }
          if (this.question.type == 'A'){
            this.audio = new Audio('../../../assets/audio-questions/khoidong/' + this.question.audioFilePath);
            this.audio.play();
          }
          else if (this.question.type == 'P'){
            this.picturePath = '../../../assets/picture-questions/khoidong/' + this.question.audioFilePath;
          }
          else if (this.question.type == 'N'){
            this.picturePath = '';
          }
        });
        this.socket.on('disable-answer-button-kd', ()=> {
          this.answerButtonDisabled = true;
        })
        this.socket.on('enable-answer-button-kd', ()=> {
          this.answerButtonDisabled = false;
        });
        this.socket.on('update-kd-time', (time) => {
          this.time = time;
        });
        this.socket.on('update-player-score', (score) => {
          this.player.score = score;
        });
        this.socket.on('update-3s-timer-kd', (time) => {
          this.threeSecTimer = time;
        });
        this.socket.on('update-clock', (clock) => {
          this.time = clock;
        })
        this.socket.on('update-match-data', (matchData) => {
          switch(matchData.matchPos){
            case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']); break;
            case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']); break;
            case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']); break;
            case 'TT_A': this.router.navigate(['/pl-tangtoc-a']); break;
            case 'VD': this.router.navigate(['pl-vd']); break;
          }
        })
      }
      else {
        console.log('Wrong token/Wrong match position');
        this.router.navigate(['/']);
      }
    });
  }
  
  counter: number = 0;
  getAnswerTurn(){
    this.socket.emit('get-turn-kd');
    this.socket.emit('start-3s-timer-kd', true)
  }
  passQuestion(){
  }

}
