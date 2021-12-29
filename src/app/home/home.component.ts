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
  matchData : any;
  ngOnInit(): void {
    this.initSocket();
  }
  auth(){
    console.log("Đăng nhập với :" + this.authString);
    this.socket.emit('init-authenticate', this.authString, (callback) => {
      if (callback.roleId == 0){
        localStorage.setItem('authString', this.authString);
        this.matchData = callback.matchData;
        this.ifAuth = true;
        this.roleID = callback.roleId;
        this.greetString = "Chào " + callback.player.name;
      }
      else if (callback.roleId == 1){ 
        this.roleID = 1;
        this.ifAuth = true;
        localStorage.setItem('authString', this.authString);
        this.greetString = "Chào BTC";
        this.matchData = callback.matchData;
        this.socket.on('update-match-data', (data) => {
          this.matchData = data;
          }
        )
      }
      else if(callback.roleId == -1){
        console.warn("Không có quyền truy cập (Secret sai)!");
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
    });
  }
  transferToKhoiDong(){
    this.socket.emit('beginMatch');
    this.router.navigate(['c-kd']);
  }

}
