import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-player-tangtoc-a',
  templateUrl: './player-tangtoc-a.component.html',
  styleUrls: ['./player-tangtoc-a.component.scss']
})
export class PlayerTangtocAComponent implements OnInit {

  socket = io(environment.socketIp);
  matchData : any = {};
  ttData : any = {};
  playerIndex : number = -1;
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
          case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']); break;
          case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']); break;
          case 'VD': this.router.navigate(['pl-vd']); break;      
      };
      this.socket.emit('get-tangtoc-data', (callback) =>{
        this.ttData = callback;
        this.ttData.playerAnswers.sort(sortByTimestamp);
      });
        this.socket.on('update-match-data', (data) => {
          console.log('Match data updated');
          this.matchData = data;
          switch(data.matchPos){
            case 'KD': this.router.navigate(['/pl-kd']); break;
            case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']); break;
            case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']); break;
            case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']); break;
            case 'VD': this.router.navigate(['pl-vd']); break;     
          };
          this.matchData = data;
        });
        this.socket.on('update-tangtoc-data', (data) => {
          this.ttData = data;
          console.log(this.ttData.playerAnswers[0].correct == true && this.ttData.showResults == true)
          this.ttData.playerAnswers.sort(sortByTimestamp);
        });
      }
    });
  }
  getTimePassed(id: number) : string {
    let readableTime = '0s0ms';
    if(this.ttData.playerAnswers[id].timestamp > 0){
      let timePassedinMs = this.ttData.playerAnswers[id].timestamp - this.ttData.timerStartTimestamp;
      readableTime = Math.trunc(timePassedinMs/1000) + 's' + timePassedinMs%1000 + 'ms';
    }
    return readableTime;
  }
}
function sortByTimestamp(a, b){
  if (a.timestamp < b.timestamp){
    return -1;
  }
  if (a.timestamp > b.timestamp){
    return 1;
  }
  return 0;
}
