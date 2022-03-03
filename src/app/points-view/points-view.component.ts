import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-points-view',
  templateUrl: './points-view.component.html',
  styleUrls: ['./points-view.component.scss']
})
export class PointsViewComponent implements OnInit {
  slideIndex = 1;
  socket = io(environment.socketIp);
  matchData: any = {};
  constructor(
    private router: Router
  ) { }
  myIndex : number = 0;
  ngOnInit(): void {
    this.socket.emit('get-match-data', (matchData) => {
      this.matchData = matchData;
      if (this.matchData.matchPos != 'PNTS'){
        switch(this.matchData.matchPos){
          case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']);
          break;
          case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']);
          break;
          case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']);
          break;
          case 'TT_A': this.router.navigate(['/pl-tangtoc-a']);
          break;
          case 'VD': this.router.navigate(['pl-vd']);
          break;
          case 'H': this.router.navigate(['']);
          break;
          case 'PNTS': this.router.navigate(['/pnts']);
          break;
          case 'KD': this.router.navigate(['/pl-kd']);
        }
        this.socket.close();
      }
    })
    this.socket.on('update-match-data', (data) => {
      this.matchData = data;
      if (this.matchData.matchPos != 'PNTS'){
        switch(this.matchData.matchPos){
          case 'VCNV_Q': this.router.navigate(['/pl-vcnv-q']);
          break;
          case 'VCNV_A': this.router.navigate(['/pl-vcnv-a']);
          break;
          case 'TT_Q': this.router.navigate(['/pl-tangtoc-q']);
          break;
          case 'TT_A': this.router.navigate(['/pl-tangtoc-a']);
          break;
          case 'VD': this.router.navigate(['pl-vd']);
          break;
          case 'H': this.router.navigate(['']);
          break;
          case 'PNTS': this.router.navigate(['/pnts']);
          break;
          case 'KD': this.router.navigate(['/pl-kd']);
        }
        this.socket.close();
      }
    })
    var interval = setInterval(() => {
      if(this.slideIndex <= 4){
        this.slideIndex++;
        console.log(this.slideIndex);
      }
      else{
        clearInterval(interval);
      }
    }, 5000)
  }
}
