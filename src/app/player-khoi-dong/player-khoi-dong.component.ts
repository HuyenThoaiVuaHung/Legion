import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import io from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { SfxService } from '../services/sfx-service.service';
@Component({
  selector: 'app-player-khoi-dong',
  templateUrl: './player-khoi-dong.component.html',
  styleUrls: ['./player-khoi-dong.component.scss']
})
export class PlayerKhoiDongComponent implements OnInit {
  socket = io(environment.socketIp);
  answerButtonDisabled = true;
  constructor(
    public router: Router,
    private sfxService: SfxService
  ) {}
  question: any = {};
  time: number = 0;
  threeSecTimer1: number = 0;
  matchData: any = {};
  threeSecTimer2: number = 0;
  audio: any = null;
  playerIndex: number = 0;
  roleId: number = -1;
  qCounter = 0;
  picturePath: string = '';
  ifGotTurn: boolean = false;
  questionObservable = new Observable((observer) => {
    this.socket.on('update-kd-question', (data) => {
      this.qCounter++;
      this.answerCache = this.question.answer;
      observer.next(data);
    });
  });
  answerCache: string = "";
  ngOnInit(): void {
    this.socket.emit('init-authenticate', localStorage.getItem('authString'), (callback) => {
      if(callback.roleId == 0 || callback.roleId == 3){
        this.matchData = callback.matchData;
        this.roleId = callback.roleId;
        switch(callback.matchData.matchPos){
          case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']); this.socket.close(); break;
          case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']); this.socket.close(); break;
          case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']); this.socket.close(); break;
          case 'TT_A': this.router.navigate(['/pl-tangtoc-a']); this.socket.close(); break;
          case 'VD': this.router.navigate(['pl-vd']); this.socket.close(); break;
          case 'H': this.router.navigate(['']); this.socket.close(); break;

        }
        this.socket.on('play-sfx', (sfxID) => {
          this.sfxService.playSfx(sfxID);
        })
        console.log('Logged in as player');
        this.questionObservable.subscribe((data) => {
          this.question = data;
          this.ifGotTurn = false;
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
        if(this.roleId == 0){
          this.playerIndex = callback.playerIndex;
          this.socket.on('disable-answer-button-kd', ()=> {
            this.answerButtonDisabled = true;
            console.log('a')
          })
          this.socket.on('enable-answer-button-kd', ()=> {
            this.answerButtonDisabled = false;
            console.log('b')
          });
          this.socket.on('player-got-turn-kd', (data) => {
            
            if(this.playerIndex == data.id - 1){
              this.ifGotTurn = true;
            }
          })
        }
        this.socket.on('update-3s-timer-kd', (time, ifPlayer) => {
          if(ifPlayer == true){
            this.threeSecTimer2 = time;
          }
          else{
            this.threeSecTimer1 = time;
          }
          if(this.time <= 0){
            this.answerButtonDisabled = true;
          }
        });
        this.socket.on('update-clock', (clock) => {
          if(clock <= 0){
            this.answerButtonDisabled = true;
          }
          this.time = clock;
        })
        this.socket.on('update-match-data', (matchData) => {
          this.matchData = matchData;
          switch(matchData.matchPos){
            case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']); this.socket.close(); break;
            case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']); this.socket.close(); break;
            case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']); this.socket.close(); break;
            case 'TT_A': this.router.navigate(['/pl-tangtoc-a']); this.socket.close(); break;
            case 'VD': this.router.navigate(['pl-vd']); this.socket.close(); break;
            case 'H': this.router.navigate(['']); this.socket.close(); break;
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
  }
  passQuestion(){
  }

}
