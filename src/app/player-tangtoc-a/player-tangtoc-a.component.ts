import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { SfxService } from '../services/sfx-service.service';

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
  roleId: number = -1;
  constructor(
    private router: Router,
    private sfxService : SfxService
  ) { }
  ngOnInit(): void {
    this.socket.emit('init-authenticate', localStorage.getItem('authString'), (callback) => {
      this.matchData = callback.matchData;
      this.roleId = callback.roleId;
      this.playerIndex = callback.playerIndex;
      if(callback.roleId == 0 || callback.roleId == 3){
        console.log('Logged in as player');
        switch(callback.matchData.matchPos){
          case 'KD': this.router.navigate(['/pl-kd']); this.socket.close(); break;
          case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']); this.socket.close(); break;
          case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']); this.socket.close(); break;
          case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']); this.socket.close(); break;
          case 'VD': this.router.navigate(['pl-vd']); this.socket.close(); break;    
          case 'H': this.router.navigate(['']); this.socket.close(); break;
  
      };
      this.sfxService.playSfx('TT_SHOWANS');
      this.socket.on('play-sfx', (sfxID) => {
        this.sfxService.playSfx(sfxID);
      })
      this.socket.emit('get-tangtoc-data', (callback) =>{
        this.ttData = callback;
        this.ttData.playerAnswers.sort(sortByTimestamp);
      });

        this.socket.on('update-match-data', (data) => {
          console.log('Match data updated');
          this.matchData = data;
          switch(data.matchPos){
            case 'KD': this.router.navigate(['/pl-kd']); this.socket.close(); break;
            case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']); this.socket.close(); break;
            case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']); this.socket.close(); break;
            case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']); this.socket.close(); break;
            case 'VD': this.router.navigate(['pl-vd']); this.socket.close(); break;   
            case 'H': this.router.navigate(['']); this.socket.close(); break;
  
          };
          this.matchData = data;
        });
        this.socket.on('update-tangtoc-data', (data) => {
          this.ttData = data;
          console.log(this.ttData.playerAnswers[0].correct == true && this.ttData.showResults == true)
          this.ttData.playerAnswers.sort(sortByTimestamp);
          if(this.ttData.showResults == true){
            let counter = 0;
            this.ttData.playerAnswers.forEach(element => {
              if (element.correct == true){
                counter++;
              }
            });
            if (counter == 0){
              this.sfxService.playSfx('TT_WRONG');
            }
            else{
              this.sfxService.playSfx('TT_CORRECT');
            }
          }
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
