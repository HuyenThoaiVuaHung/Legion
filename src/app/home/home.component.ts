import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';
import { Router } from '@angular/router';
import { Player } from '../services/interfaces/player.interface';
import { of } from 'rxjs';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(/*private socketService: SocketService*/private router: Router) { }
  displayedPlayerColumns: string[] = ['id','name'];
  ifAuth : boolean = false;
  roleID: number = 0;
  socket = io.connect('http://localhost:3000');
  authString: string = '';
  greetString: string = "Chào ";
  playerList: any[] = [];
  ngOnInit(): void {
    this.initSocket();
  }
  auth(){
    console.log(this.authString);
    this.socket.emit('init-authenticate', this.authString, (callback) => {
      console.log(callback.ifValid);
      if(callback.ifValid == true){
        console.log('abcdfeasdgfagdfbvcx')
        this.ifAuth = true;
        console.log(callback.playerInfo);
        localStorage.setItem('authString', this.authString);
        if (callback.playerInfo != undefined){
          this.greetString = "Chào " + callback.playerInfo.name;
        }
        else{
          this.greetString = "Chào BTC"
          this.playerList = callback.connectedPlayers;
          this.socket.on('update-connected-players', (data) => {
            this.playerList = data;
            console.log(this.playerList);
            }
          )
        }
      }
      else {
        console.log('Wrong token')
      }
    });
  }
  initSocket(){
    this.socket.on('beginMatch', () => {
      if (this.ifAuth == true) {
        this.router.navigate(['pl-kd']);
      }
      else {
        this.socket.emit('error', 'Not authenticated' + this.socket.id)
      }
    }) 
  }
  transferToKhoiDong(){
    this.socket.emit('beginMatch');
    this.router.navigate(['c-kd']);
  }

}
