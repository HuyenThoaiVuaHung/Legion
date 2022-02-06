import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-player-vcnv-answer',
  templateUrl: './player-vcnv-answer.component.html',
  styleUrls: ['./player-vcnv-answer.component.scss']
})
export class PlayerVcnvAnswerComponent implements OnInit {
  socket = io(environment.socketIp);
  matchData : any = {};
  vcnvData : any = {};
  playerIndex : number = -1;
  roleId: number = -1;
  disabledCNVButton: boolean = false;
  constructor(
    private router: Router
  ) { }
  ngOnInit(): void {
    this.socket.emit('init-authenticate', localStorage.getItem('authString'), (callback) => {
      this.matchData = callback.matchData;
      this.playerIndex = callback.playerIndex;
      this.roleId = callback.roleId;
      if(callback.roleId == 0 || callback.roleId == 3){
        console.log('Logged in as player');
        switch(callback.matchData.matchPos){
          case 'KD': this.router.navigate(['/pl-kd']); break;
          case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']); break;
          case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']); break;
          case 'TT_A': this.router.navigate(['/pl-tangtoc-a']); break;
          case 'VD': this.router.navigate(['pl-vd']); break;      
          case 'H': this.router.navigate(['']); break;

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
            case 'H': this.router.navigate(['']); break;
 
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
