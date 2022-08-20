import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-single-point-ts',
  templateUrl: './single-point-ts.component.html',
  styleUrls: ['./single-point-ts.component.scss']
})
export class SinglePointTsComponent implements OnInit {
  socket = io(environment.socketIp)
  constructor() { }
  id = '';
  stt = -1;
  state = false;
  matchData: any;
  ngOnInit(): void {
  }
  login(){
    this.socket.emit('get-match-data', (callback) => {
      this.matchData = callback;
    })
    this.socket.on('update-match-data', (callback) => {
      this.matchData = callback;
    })
    this.stt = Number.parseInt(this.id);
    this.state = true;
  }
}
