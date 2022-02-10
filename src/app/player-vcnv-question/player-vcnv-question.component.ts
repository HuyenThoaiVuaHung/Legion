import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { SfxService } from '../services/sfx-service.service';

@Component({
  selector: 'app-player-vcnv-question',
  templateUrl: './player-vcnv-question.component.html',
  styleUrls: ['./player-vcnv-question.component.scss']
})
export class PlayerVcnvQuestionComponent implements OnInit {
  socket = io(environment.socketIp);
  constructor( private router: Router, private sfxService: SfxService ) { }
  imageSource = '../../assets/abcdxyz.png';
  vcnvData : any = {};
  matchData: any = {};
  currentTime : number = 0;
  curVCNVQuestion : any = {};
  highlightedVCNVQuestion : any = {};
  VCNVStrings : string[] = [];
  answerCache : string = '';
  playerAnswer: string = '';
  playerIndex : number = 0;
  roleId: number = -1;
  disabledCNVButton : boolean = false;
  audio :any = null;
  ngOnInit(): void {
    this.socket.emit('init-authenticate', localStorage.getItem('authString'), (callback) => {
      this.matchData = callback.matchData;
      this.playerIndex = callback.playerIndex;
      this.roleId = callback.roleId;
      if(callback.roleId == 0 || callback.roleId == 3){

        switch(callback.matchData.matchPos){
          case 'KD': this.router.navigate(['/pl-kd']); this.socket.close(); break;
          case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']); this.socket.close(); break;
          case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']); this.socket.close(); break;
          case 'TT_A': this.router.navigate(['/pl-tangtoc-a']); this.socket.close(); break;
          case 'VD': this.router.navigate(['pl-vd']); this.socket.close(); break;    
          case 'H': this.router.navigate(['']); this.socket.close(); break;
  
      };
      if(callback.roleId == 0){
        this.socket.emit('clear-player-answer')
      }
      this.socket.on('play-sfx', (sfx) => {
        this.sfxService.playSfx(sfx);
      })
        this.socket.on('update-match-data', (data) => {
          this.matchData = data;
          switch(data.matchPos){
            case 'KD': this.router.navigate(['/pl-kd']); this.socket.close(); break;
            case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']); this.socket.close(); break;
            case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']); this.socket.close(); break;
            case 'TT_A': this.router.navigate(['/pl-tangtoc-a']); this.socket.close(); break;
            case 'VD': this.router.navigate(['pl-vd']); this.socket.close(); break; 
            case 'H': this.router.navigate(['']); this.socket.close(); break;
  
        };
          this.matchData = data;
        });
        this.socket.on('update-vcnv-data', (data) => {
          this.vcnvData = data;
          this.formatStrings();
        });
        this.socket.on('update-clock', (clock) => {
          this.currentTime = clock;
        })
        this.socket.emit('get-vcnv-data', (callback) =>{
          this.vcnvData = callback;
          console.log(this.vcnvData);
          if (this.vcnvData.disabledPlayers.includes(this.playerIndex)){
            this.disabledCNVButton = true;
          }
          this.formatStrings();
        });
        this.socket.on('update-highlighted-vcnv-question', (index) => {
          this.highlightedVCNVQuestion = this.vcnvData.questions[index - 1];
        })
        this.socket.on('update-vcnv-question', (data) => {
          this.curVCNVQuestion = data;
          if (this.curVCNVQuestion.type == 'HN_S') {
            this.audio = new Audio('../../../assets/audio-questions/vcnv/' + this.curVCNVQuestion.audioFilePath);
            this.audio.play();
          }
          else if (this.audio != null){
            this.audio.pause();
          }
        })
      }
      else {
        console.log('Wrong token');
      }
    })
  }
  formatStrings(){
    for(let i: number = 0; i <= 5; i++){
      this.VCNVStrings[i] = this.vcnvData.questions[i].answer;
    }
    this.VCNVStrings.forEach((element, index) => {
      element = element.replace(/\s/g, '');
      element = element.toUpperCase();
      if (this.vcnvData.questions[index].ifOpen == false){
        let processedString = '';
        for (let i = 0; i < element.length; i++){
          processedString += '◯';
        }
        element = processedString;
      }
      this.VCNVStrings[index] = element;
    })
  }
  submitAnswer(){
    if (this.currentTime > 0){
      this.answerCache = this.playerAnswer.toUpperCase();
      this.socket.emit('submit-answer-vcnv', this.playerAnswer)
    }
  }
  attemptVCNV(){
    this.socket.emit('attempt-cnv-player', Date.now());
    this.socket.emit('play-sfx', 'VCNV_OBSTACLE');
    this.disabledCNVButton = true;
  }
}
