import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { CommonService } from './services/common.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Legion';
  socket = io(environment.socketIp);
  isBlocked: boolean = true;
  roleId: number = -1;
  matchPosCache: string = '';
  closeBlockFrame() {
    this.isBlocked = false;
  }
  constructor(private router: Router, private service: CommonService) {

  }
  ngOnInit(): void {
    this.socket.emit('verify-identity', localStorage.getItem('authString'), (callback: { roleId: number; }) => {
      this.roleId = callback.roleId;
      if (['/sc-kd','/sc-vd','/sc-qb', '/rl-pnts'].includes(this.router.url)) this.closeBlockFrame(); 
      if (this.roleId != 1) this.socket.close()
      else {
        this.service.data$.subscribe((data) => {
          this.roleId = data;
          console.log(this.roleId);
        });
      }
    });

    
  }
  changeMatchPosAdmin(pos: string) {
    switch (pos) {
      case 'VCNV_Q': this.router.navigate(['/c-vcnv']);
        break;
      case 'KD': this.router.navigate(['/c-kd']);
        break;
      case 'TT_Q': this.router.navigate(['/c-tt']);
        break;
      case 'VD': this.router.navigate(['/c-vd']);
        break;
      case 'CHP': this.router.navigate(['/c-chp']);
        break;
      case 'H': this.router.navigate(['']);
    }
  }
  togglePoints() {
    this.socket.emit('get-match-data', (data: { matchPos: string; }) => {
      if (data.matchPos == 'PNTS') {
        switch (this.matchPosCache) {
          case 'VCNV_Q': this.router.navigate(['/c-vcnv']);
            this.socket.emit('change-match-position', 'VCNV_Q', localStorage.getItem('authString'));
            break;
          case 'KD': this.router.navigate(['/c-kd']);
            this.socket.emit('change-match-position', 'KD', localStorage.getItem('authString'));
            break;
          case 'TT_Q': this.router.navigate(['/c-tt']);
            this.socket.emit('change-match-position', 'TT_Q', localStorage.getItem('authString'));
            break;
          case 'VD': this.router.navigate(['/c-vd']);
            this.socket.emit('change-match-position', 'VD', localStorage.getItem('authString'));
            break;
          case 'CHP': this.router.navigate(['/c-chp']);
            this.socket.emit('change-match-position', 'CHP', localStorage.getItem('authString'));
            break;
          default: this.router.navigate(['/c-kd']);
            this.socket.emit('change-match-position', 'KD', localStorage.getItem('authString'));
            break;
        }
      }
      else {
        this.matchPosCache = data.matchPos;
        this.socket.emit('change-match-position', 'PNTS', localStorage.getItem('authString'));
      }
    })
  }
}
