import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as io from 'socket.io-client';
@Component({
  selector: 'app-player-khoi-dong',
  templateUrl: './player-khoi-dong.component.html',
  styleUrls: ['./player-khoi-dong.component.scss']
})
export class PlayerKhoiDongComponent implements OnInit {
  socket = io.connect('http://localhost:3000');
  constructor(
    public router: Router
  ) { }
  question: string = "abcdadsfaef";
  ngOnInit(): void {
    this.socket.emit('init-authenticate', localStorage.getItem('authString'), (callback) => {
      if(callback.roleId == 0 && callback.matchData.matchPos == 'KD'){
        console.log('Logged in as player');
        this.socket.on('update-kd-question', (data) => {
          this.question = data.question;
        })
      }
      else {
        console.log('Wrong token/Wrong match position');
        this.router.navigate(['/']);
      }
    });
    this.socket.on('update-kd-question', (data) => {
      this.changeDisplayedString(data);
    })
  }
  changeDisplayedString(string: string){
    this.question = "ABCIHJXOHVOH";
  }

}
