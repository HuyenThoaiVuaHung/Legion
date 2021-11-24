import { Component, OnInit } from '@angular/core';
import {io} from 'socket.io-client';
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
  ifAuth : boolean = false;
  roleID: number = 0;
  socket = io('http://localhost:3000');
  authString: string = '';
  greetString: string = "Chào ";
  ngOnInit(): void {
    this.initSocket();
  }
  auth(){
    this.socket.emit('authenticate', this.authString, (info, ifValid) => {
      if(ifValid){
        this.ifAuth = true;
        localStorage.setItem('authString', this.authString);
        if (info.name != undefined){
          this.authString = info.name;
          this.roleID = info.roleID;
          this.greetString = "Chào " + info.name;
        }
        else {
          this.authString = "Chào BTC";
          this.roleID = info.roleID;
        }
      }
    });
  }
  initSocket(){
    this.socket.on('connect', () => {
      console.log('connected');
    })
    this.socket.on('beginMatch', () => {
      if (this.ifAuth == true) {
        this.router.navigate(['pl-kd']);
      }
      else {
        this.socket.emit('error', 'Not authenticated' + this.socket.id)
      }
    }) 
  }

}
