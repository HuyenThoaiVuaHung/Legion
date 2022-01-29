import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-player-vcnv-answer',
  templateUrl: './player-vcnv-answer.component.html',
  styleUrls: ['./player-vcnv-answer.component.scss']
})
export class PlayerVcnvAnswerComponent implements OnInit {
  socket = io('http://localhost:3000');
  matchData : any = {};
  vcnvData : any = {};
  playerIndex : number = -1;
  disabledCNVButton: boolean = false;
  constructor(
    private router: Router
  ) { }
  ngOnInit(): void {
    this.socket.emit('init-authenticate', localStorage.getItem('authString'), (callback) => {
      this.matchData = callback.matchData;
      this.playerIndex = callback.playerIndex;
      if(callback.roleId == 0){
        console.log('Logged in as player');
        switch(callback.matchData.matchPos){
          case 'KD': this.router.navigate(['/pl-kd']); break;
          case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']); break;
          case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']); break;
          case 'TT_A': this.router.navigate(['/pl-tangtoc-a']); break;
          case 'VD': this.router.navigate(['pl-vd']); break;      
      };
      this.socket.emit('get-vcnv-data', (callback) =>{
        this.vcnvData = callback;
        if (this.vcnvData.disabledPlayers.includes(this.playerIndex)){
          this.disabledCNVButton = true;
        }
      });
        this.socket.on('update-match-data', (data) => {
          console.log('Match data updated');
          this.matchData = data;
          switch(data.matchPos){
            case 'KD': this.router.navigate(['/pl-kd']); break;
            case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']); break;
            case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']); break;
            case 'TT_A': this.router.navigate(['/pl-tangtoc-a']); break;
            case 'VD': this.router.navigate(['pl-vd']); break;   
        };
          this.matchData = data;
        });
        this.socket.on('update-vcnv-data', (data) => {
          this.vcnvData = data;
        });
      }
    });
  }
  attemptCNV(){
    this.socket.emit('attempt-cnv-player', Date.now());
    this.disabledCNVButton = true;
  }

}
