import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sc-ve-dich',
  templateUrl: './sc-ve-dich.component.html',
  styleUrls: ['./sc-ve-dich.component.scss']
})
export class ScVeDichComponent implements OnInit {
  socket = io(environment.socketIp);
  constructor() { }
  vdData : any = {};
  matchData : any = {};
  currentQuestion: any = {};
  time = 0;
  playerStealingQuestion: number = -1;
  ngOnInit(): void {
    this.socket.emit('get-vedich-data', (callback) =>{
      this.vdData = callback;
    })
    this.socket.on('update-vedich-data', (data) => {
      this.vdData = data;
    });
    this.socket.emit('get-match-data', (callback) =>{
      this.matchData = callback;
    })
    this.socket.on('update-match-data', (data) => {
      this.matchData = data;
    });
    this.socket.on('update-vedich-question', (question) => {
      if(question != undefined){
        this.currentQuestion = question;
      }
      else{
        this.currentQuestion = {};
      }
    });
    this.socket.on('player-steal-question', (id) => {
      this.playerStealingQuestion = id;
    })
    this.socket.on('clear-stealing-player', () =>{
      this.playerStealingQuestion = -1;
    })
    this.socket.on('update-clock', (time) => {
      this.time = time;
    })
  }

}
