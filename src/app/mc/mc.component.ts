import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
          this.formatStrings();
          this.imagePath = '../../../assets/picture-questions/vcnv/' + this.vcnvData.questions[5].picFileName;
        });
        this.socket.emit('get-vedich-data', (callback: any) => {
          this.vdData = callback;
        });
        this.socket.on('clear-turn-player-kd', () => {
          this.kdTurn = -1;
        })
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
        });
        this.socket.on('clear-stealing-player', () => {
          this.stealingPlayerIndex = -1;
        })
        this.socket.on('update-vcnv-data', (data) => {
          this.vcnvData = data;
          this.formatStrings();
          this.imagePath = '../../../assets/picture-questions/vcnv/' + this.vcnvData.questions[5].picFileName;
        })
        this.socket.on('update-vedich-data', (data) => {
          this.vdData = data;
        })
        this.socket.on('update-tangtoc-data', (data) => {
          this.ttData = data;
          this.ttData.playerAnswers.sort(sortByTimestamp);
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
  VCNVStrings: string[] = [];
  formatStrings() {
    for (let i: number = 0; i <= 5; i++) {
      this.VCNVStrings[i] = this.vcnvData.questions[i].answer;
    }
    this.VCNVStrings.forEach((element, index) => {
      element = element.replace(/\s/g, '');
      element = element.toUpperCase();
      if (this.vcnvData.questions[index].ifOpen == false) {
        let processedString = '';
        for (let i = 0; i < element.length; i++) {
          processedString += '◯';
        }
        element = processedString;
      }
      this.VCNVStrings[index] = element;
    })
  }
  counter: number = 0;
  getAnswerTurn(){
    this.socket.emit('get-turn-kd');
    this.socket.emit('start-3s-timer-kd', true)
  }
  passQuestion(){
  }
  getTimePassed(id: number) : string {
    let readableTime = '0s0ms';
    if(this.ttData.playerAnswers[id].timestamp > 0){
      let timePassedinMs = this.ttData.playerAnswers[id].timestamp - this.ttData.timerStartTimestamp;
      readableTime = Math.trunc(timePassedinMs/1000) + 's' + timePassedinMs%1000 + 'ms';
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