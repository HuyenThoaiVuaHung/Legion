import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-mc',
  templateUrl: './mc.component.html',
  styleUrls: ['./mc.component.scss']
})
export class McComponent implements OnInit {
  socket = io(environment.socketIp);
  answerButtonDisabled = false;
  constructor(
    public router: Router
  ) {}
  question: any = {};
  time: number = 0;
  player: any = {};
  matchData: any = {};
  vdData: any = {};
  vcnvData: any = {};
  ttData: any = {};
  kdTurn: number = 0;
  imagePath: string = '../../../assets/images/';
  stealingPlayerIndex: number = -1;
  answerCache: string = '';
  ngOnInit(): void {
    this.socket.emit('init-authenticate', localStorage.getItem('authString'), (callback) => {
      if(callback.roleId == 2){
        console.log('Logged in as MC');
        this.matchData = callback.matchData;
        this.socket.on('update-kd-question', (data) => {
          this.answerCache = this.question.answer;
          this.question = data;
        });
        this.socket.on('update-clock', (clock) => {
          this.time = clock;
        })
        this.socket.on('player-got-turn-kd', (player) => {
          this.kdTurn = player.id;
        })
        this.socket.on('player-steal-question', (id) => {
          this.stealingPlayerIndex = id;
        });
        this.socket.emit('get-vcnv-data', (callback: any) => {
          this.vcnvData = callback;
          this.imagePath = '../../../assets/picture-questions/vcnv/' + this.vcnvData.questions[5].picFileName;
        });
        this.socket.emit('get-vedich-data', (callback: any) => {
          this.vdData = callback;
        });
        this.socket.emit('get-tangtoc-data', (callback: any) => {
          this.ttData = callback;
        });
        this.socket.on('next-question', () => {
          this.kdTurn = 0;
        })
        this.socket.on('update-vcnv-question', (question) => {
          this.question = question;
        })
        this.socket.on('update-tangtoc-question', (question) => {
          this.question = question;
        })
        this.socket.on('update-vedich-question', (question) => {
          this.question = question;
        })
        this.socket.on('update-vcnv-data', (data) => {
          this.vcnvData = data;
          this.imagePath = '../../../assets/picture-questions/vcnv/' + this.vcnvData.questions[5].picFileName;
        })
        this.socket.on('update-vedich-data', (data) => {
          this.vdData = data;
        })
        this.socket.on('update-tangtoc-data', (data) => {
          this.ttData = data;
        })
        this.socket.emit('get-match-data')
        this.socket.on('update-match-data', (matchData: any) => {
          this.matchData = matchData;
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
