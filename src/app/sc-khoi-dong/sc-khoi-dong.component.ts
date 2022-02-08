import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sc-khoi-dong',
  templateUrl: './sc-khoi-dong.component.html',
  styleUrls: ['./sc-khoi-dong.component.scss']
})
export class ScKhoiDongComponent implements OnInit {
  socket = io(environment.socketIp);
  constructor() { }
  matchData : any = {};
  currentQuestion: any = {};
  time = 0;
  threeSecTimers: number[] = [0,0];
  playerGotTurn: any = {};
  ngOnInit(): void {
    this.socket.emit('get-match-data', (callback) =>{
      this.matchData = callback;
    })
    this.socket.on('update-match-data', (data) => {
      this.matchData = data;
    });
    this.socket.on('update-kd-question', (question) => {
      if(question != undefined){
        this.currentQuestion = question;
      }
      else{
        this.currentQuestion = {};
      }
    });

    this.socket.on('player-got-turn-kd', (player) =>{
      if(player != undefined){
        this.playerGotTurn = player;
      }
    })
    this.socket.on('clear-turn-player-kd', () => {
      this.playerGotTurn = {};
    })
    this.socket.on('update-clock', (time) => {
      this.time = time;
    })
    this.socket.on('update-3s-timer-kd', (time, ifPlayer) => {
      if(ifPlayer == true){
        this.threeSecTimers[1] = time;
      }
      else{
        this.threeSecTimers[0] = time;
      }
    });
  }
}
