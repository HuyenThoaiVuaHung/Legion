import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
declare var videojs: any;
@Component({
  selector: 'app-player-tangtoc-q',
  templateUrl: './player-tangtoc-q.component.html',
  styleUrls: ['./player-tangtoc-q.component.scss']
})
export class PlayerTangtocQComponent implements OnInit {

  socket = io('http://localhost:3000');
  constructor( private router: Router) { }
  imageSource = '';
  videoSource = '';
  ttData : any = {};
  matchData: any = {};
  currentTime : number = 0;
  curQuestion : any = {};
  highlightedVCNVQuestion : any = {};
  answerCache : string = '';
  playerIndex : number = 0;
  playerAnswer : string = '';
  audio :any = null;
  ngOnInit(): void {
    this.socket.emit('init-authenticate', localStorage.getItem('authString'), (callback) => {
      this.matchData = callback.matchData;
      this.playerIndex = callback.playerIndex
      if(callback.roleId == 0){
        this.socket.emit('clear-player-answer')
        switch(callback.matchData.matchPos){
          case 'KD': this.router.navigate(['/pl-kd']); break;
          case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']); break;
          case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']); break;
          case 'TT_A': this.router.navigate(['/pl-tangtoc-a']); break;
          case 'VD': this.router.navigate(['pl-vd']); break;      
      };
        this.socket.on('update-match-data', (data) => {
          this.matchData = data;
          switch(data.matchPos){
            case 'KD': this.router.navigate(['/pl-kd']); break;
            case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']); break;
            case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']); break;
            case 'TT_A': this.router.navigate(['/pl-tangtoc-a']); break;
            case 'VD': this.router.navigate(['pl-vd']); break;   
        };
          this.matchData = data;
        });
        this.socket.emit('get-tangtoc-data', (callback) =>{
          this.ttData = callback;
        })
        this.socket.emit('clear-answer-tt');
        this.socket.on('update-tangtoc-data', (data) => {
          this.ttData = data;
          if (this.curQuestion.type == 'TT_IMG'){
            if(this.ttData.showAnswer == true){
              this.imageSource = "../../../assets/picture-questions/tt/" + this.ttData.questions[this.curQuestion.id - 1].answer_image;
            }
            else{
              this.imageSource = "../../../assets/picture-questions/tt/" + this.ttData.questions[this.curQuestion.id - 1].question_image;
            }
          }
        });
        this.socket.on('update-clock', (clock) => {
          this.currentTime = clock;
        })
        this.socket.on('update-tangtoc-question', (question) =>{
          if(question != undefined){
            this.curQuestion = question;
            if (this.curQuestion.type == 'TT_IMG'){
              if(this.ttData.showAnswer == true){
                this.imageSource = "../../../assets/picture-questions/tt/" + this.ttData.questions[this.curQuestion.id - 1].answer_image;
              }
              else{
                this.imageSource = "../../../assets/picture-questions/tt/" + this.ttData.questions[this.curQuestion.id - 1].question_image;
              }
            }
            else if (this.curQuestion.type == 'TT_VD'){
              this.videoSource =  "../../../assets/video-questions/tt/" + this.ttData.questions[this.curQuestion.id - 1].video_name;
              setTimeout(() => {
                this.togglePlay();
              }, 200)
            }
          }
          else{
            this.curQuestion = {};
          }
        });
      }
    });
  }
  togglePlay(){
    var myPlayer: HTMLVideoElement = document.getElementById('video-1') as HTMLVideoElement;
    if (myPlayer != null){
      if (myPlayer.paused == true) {
        myPlayer.play();
      }
      else {
        myPlayer.pause();
      }
    }
  }
  submitAnswer(){
    this.socket.emit('player-submit-answer-tangtoc', this.playerAnswer, Date.now());
    this.answerCache = this.playerAnswer;
    this.socket.emit('')
  }
}
