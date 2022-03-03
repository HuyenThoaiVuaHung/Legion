import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { FormPlayerComponent } from '../form-player/form-player.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(/*private socketService: SocketService*/private router: Router
    , private dialog: MatDialog) { }
  displayedPlayerColumns: string[] = ['id', 'name', 'score', 'active'];
  ifAuth: boolean = false;
  roleID: number = 0;
  socket = io.connect(environment.socketIp);
  authString: string = '';
  greetString: string = "Chào ";
  fileName = '';
  matchData: any;
  player: any;
  ngOnInit(): void {
    this.initSocket();
    this.socket.emit('get-match-data', (callback) => {
      this.matchData = callback;
    })
  }
  auth() {
    console.log("Đăng nhập với :" + this.authString);

    this.socket.emit('init-authenticate', this.authString, (callback) => {
      if (callback.roleId == 0) {
        localStorage.setItem('authString', this.authString);
        this.matchData = callback.matchData;
        this.ifAuth = true;
        this.roleID = callback.roleId;
        this.greetString = "Chào " + callback.player.name;
        this.socket.on('update-match-data', (data) => {
          this.matchData = data;
          if (this.matchData.matchPos != 'H'){
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
        }
        )
        if (this.matchData.matchPos != 'H'){
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
      }
      else if (callback.roleId == 1) {
        this.roleID = 1;
        this.ifAuth = true;
        localStorage.setItem('authString', this.authString);
        this.greetString = "Chào BTC";
        this.matchData = callback.matchData;
        this.socket.emit('change-match-position', 'H');
        this.socket.on('update-match-data', (data) => {
          this.matchData = data;
        }
        )
      }
      else if (callback.roleId == 2) {
        this.roleID = 2;
        this.ifAuth = true;
        localStorage.setItem('authString', this.authString);
        this.greetString = "Chào MC";
        this.matchData = callback.matchData;
        this.socket.on('update-match-data', (data) => {
          this.matchData = data;
          if (this.matchData.matchPos != 'H') {
            this.router.navigate(['mc'])
          }
        }
        )
      }
      else if (callback.roleId == 3) {
        this.roleID = 3;
        this.ifAuth = true;
        localStorage.setItem('authString', this.authString);
        this.greetString = "Viewer";
        this.matchData = callback.matchData;
        this.socket.on('update-match-data', (data) => {
          this.matchData = data;
          switch (this.matchData.matchPos) {
            case 'KD': this.router.navigate(['pl-kd']); break;
            case 'VCNV_Q': this.router.navigate(['pl-vcnv-q']); break;
            case 'VCNV_A': this.router.navigate(['pl-vcnv-a']); break;
            case 'TT_Q': this.router.navigate(['pl-tangtoc-q']); break;
            case 'TT_A': this.router.navigate(['pl-tangtoc-a']); break;
            case 'VD': this.router.navigate(['pl-vd']); break;
            case 'H': this.router.navigate(['']); break;
          }
        }
        )
        switch (this.matchData.matchPos) {
          case 'KD': this.router.navigate(['pl-kd']); break;
          case 'VCNV_Q': this.router.navigate(['pl-vcnv-q']); break;
          case 'VCNV_A': this.router.navigate(['pl-vcnv-a']); break;
          case 'TT_Q': this.router.navigate(['pl-tangtoc-q']); break;
          case 'TT_A': this.router.navigate(['pl-tangtoc-a']); break;
          case 'VD': this.router.navigate(['pl-vd']); break;
          case 'H': this.router.navigate(['']); break;
        }
      }
    });
  }
  initSocket() {
    this.socket.on('beginMatch', () => {
      if (this.ifAuth == true) {
        this.router.navigate(['pl-kd']);
      }
      else {
        this.socket.emit('error', 'Not authenticated' + this.socket.id)
      }
    });
  }
  editPlayer(row: any) {
    let player = this.matchData.players[this.matchData.players.indexOf(row)];
    const dialogRef = this.dialog.open(FormPlayerComponent, {
      data: player
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        var payload: any = { player: result, index: this.matchData.players.indexOf(row) };
        payload.player.score = parseInt(payload.player.score);
        this.socket.emit('edit-player-info', payload, (callback) => {
          console.log(callback.message);
        });
      }
    });
  }
  transferToKhoiDong() {
    this.socket.emit('beginMatch');
    this.router.navigate(['c-kd']);
  }
  onFileSelected(event) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        const bufferArray = e.target?.result;
        const wb = XLSX.read(bufferArray, { type: 'buffer' });
        const kdSheet = wb.Sheets[wb.SheetNames[0]];
        const vcnvSheet = wb.Sheets[wb.SheetNames[1]];
        const ttSheet = wb.Sheets[wb.SheetNames[2]];
        const vdSheet = wb.Sheets[wb.SheetNames[3]];
        const payload: any = {
          kd: XLSX.utils.sheet_to_json(kdSheet),
          vcnv: XLSX.utils.sheet_to_json(vcnvSheet),
          tt: XLSX.utils.sheet_to_json(ttSheet),
          vd: XLSX.utils.sheet_to_json(vdSheet)
        }
        this.socket.emit('update-data-from-excel', payload, (callback) => {
          console.log(callback.message);
        });
        console.log(payload);
      }
    }

  }
}