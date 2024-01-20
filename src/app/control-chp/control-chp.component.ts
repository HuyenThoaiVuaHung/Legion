import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';
import { Router } from '@angular/router';
import { FormQKdComponent } from '../form-q-kd/form-q-kd.component';
import { MatDialog } from '@angular/material/dialog';
import { FormPlayerComponent } from '../form-player/form-player.component';
import { environment } from 'src/environments/environment';
import { FormQchpComponent } from '../form-qchp/form-qchp.component';

@Component({
  selector: 'app-control-chp',
  templateUrl: './control-chp.component.html',
  styleUrls: ['./control-chp.component.scss']
})
export class ControlChpComponent implements OnInit {

  constructor(
    private router: Router,
    public dialog: MatDialog,
  ) {

  }
  socket = io.connect(environment.socketIp);
  displayingRow: any = null;
  chosenRow: any = null;
  currentTime: number = 0;
  displayedQuestionColumns: string[] = ['question', 'answer'];
  displayedPlayerColumns: string[] = ['id', 'name', 'score', 'active', 'playing'];
  authString: string = '';
  matchData: any = {};
  chpData: any = {};
  lastTurn: any = { name: '' };
  threeSecTimers: number[] = [0, 0];
  ngOnInit(): void {
    this.authString = localStorage.getItem('authString') || '';
    this.socket.emit('init-authenticate', this.authString, (callback) => {
      if (callback.roleId == 1) {
        console.log('Logged in as admin');
        this.socket.emit('change-match-position', 'CHP');
        this.matchData = callback.matchData;
        this.socket.on('update-match-data', (data) => {
          this.matchData = data;
        }
        )
        this.socket.on('update-chp-data-admin', (data) => {
          this.chpData = data;
        });
        this.socket.on('update-clock', (clock) => {
          this.currentTime = clock;
        })
        this.socket.emit('get-chp-data', (callback) => {
          this.chpData = callback;
        });
        this.socket.on('disconnect', () => {
          this.socket.emit('leave-match', (this.authString))
        })
        this.socket.on('got-turn-chp', (id) => {
          this.lastTurn = this.matchData.players[id];
        })
      }
      else {
        console.log('');
        this.router.navigate(['/']);
      }
    });
  }
  onClickQuestion(row: any) {
    this.chosenRow = row;
  }
  onDoubleClickQuestion(row: any) {
    this.displayingRow = row;
    this.socket.emit('broadcast-chp-question', this.chpData.questions.indexOf(this.displayingRow), callback => {
      console.log(callback.message);
    });
  }
  onDoubleClickPlayer(row: any) {
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
  editQuestion() {
    let question = this.chpData.questions[this.chpData.questions.indexOf(this.chosenRow)];
    const dialogRef = this.dialog.open(FormQchpComponent, {
      data: question
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.chpData.questions[this.chpData.questions.indexOf(this.chosenRow)] = result;
        this.socket.emit('update-chp-data', this.chpData, (callback) => {
          console.log(callback.message);
        });
      }
    });
  }
  playSfx(sfxId: string) {
    this.socket.emit('play-sfx', sfxId);
  }
  clockStart() {
    this.socket.emit('start-timer-chp', (callback) => {
      console.log(callback.message);
    });
  }
  clockPause() {
    this.socket.emit('play-pause-clock', this.currentTime);
  }
  markCorrect() {
    if (this.lastTurn.name != '') {
      this.socket.emit('mark-correct-chp');
      this.lastTurn = { name: '' };
    }
  }
  markWrong() {
    if (this.lastTurn.name != '') {
      this.socket.emit('mark-wrong-chp');
      this.lastTurn = { name: '' };
    }
  }
  clearQuestion() {
    this.socket.emit('clear-question-chp');
  }
  showPoints() {
    if (this.matchData.matchPos == 'PNTS') {
      this.socket.emit('change-match-position', 'CHP');
    }
    else {
      this.socket.emit('change-match-position', 'PNTS');
    }
  }
}
