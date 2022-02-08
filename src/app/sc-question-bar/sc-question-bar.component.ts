import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sc-question-bar',
  templateUrl: './sc-question-bar.component.html',
  styleUrls: ['./sc-question-bar.component.scss']
})
export class ScQuestionBarComponent implements OnInit {
  constructor() { }
  socket = io(environment.socketIp);
  vdData : any = {};
  ngOnInit(): void {
    this.socket.emit('get-vedich-data', (callback) =>{
      this.vdData = callback;
    })
    this.socket.on('update-vedich-data', (data) => {
      this.vdData = data;
    });
  }

}
