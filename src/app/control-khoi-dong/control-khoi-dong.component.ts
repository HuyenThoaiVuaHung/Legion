import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';
import { Router } from '@angular/router';
import { FormQKdComponent } from '../form-q-kd/form-q-kd.component';
import { MatDialog } from '@angular/material/dialog';
import { FormPlayerComponent } from '../form-player/form-player.component';
import { environment } from 'src/environments/environment';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-control-khoi-dong',
  templateUrl: './control-khoi-dong.component.html',
  styleUrls: ['./control-khoi-dong.component.scss']
})
export class ControlKhoiDongComponent implements OnInit {

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private service: CommonService
  ) {

  }
  socket = io.connect(environment.socketIp);
  displayingRow: any = null;
  chosenRow: any = null;
  currentTime: number = 0;
  displayedQuestionColumns: string[] = ['question', 'answer', 'type', 'subject'];
  displayedPlayerColumns: string[] = ['id', 'name', 'score', 'active'];
  authString: string = '';
  currentMaxQuestionNo : number = 0;
  currentQuestionNo: number = 0;
  matchData: any = {};
  kdData: any = {};
  currentQuestionCount: number = 0;
  lastTurn: any = { name: '' };
  threeSecTimers: number[] = [0, 0];
  ngOnInit(): void {
    this.authString = localStorage.getItem('authString') || '';
    console.log(this.authString);
    this.socket.emit('init-authenticate', this.authString, (callback) => {
      this.service.changeData(callback.roleId);
      if (callback.roleId == 1) {
        console.log('Logged in as admin');
        this.socket.emit('change-match-position', 'KD')
        this.matchData = callback.matchData;
        this.socket.on('update-match-data', (data) => {
          this.matchData = data;
        }
        )
        this.socket.on('update-kd-data-admin', (data) => {
          this.kdData = data;
        });
        this.socket.on('update-number-question', (max,curr) => {
          this.currentMaxQuestionNo = max;
          this.currentQuestionNo = curr;
        })
        this.socket.on('update-clock', (clock) => {
          this.currentTime = clock;
        })
        this.socket.emit('get-kd-data-admin', (callback) => {
          this.kdData = callback;
        });
        this.socket.on('disconnect', () => {
          this.socket.emit('leave-match', (this.authString))
        })
        this.socket.on('player-got-turn-kd', (player) => {
          this.lastTurn = player;
        })
        this.socket.on('next-question', () => {
          this.nextQuestion();
          this.lastTurn.name = '';
        })
        this.socket.on('update-3s-timer-kd', (timer, ifPlayer) => {
          if (ifPlayer) {
            this.threeSecTimers[1] = timer;
          }
          else {
            this.threeSecTimers[0] = timer;
          }
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
    this.socket.emit('broadcast-kd-question', this.kdData.questions.indexOf(this.displayingRow), callback => {
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
    let question = this.kdData.questions[this.kdData.questions.indexOf(this.chosenRow)];
    const dialogRef = this.dialog.open(FormQKdComponent, {
      data: question
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        var payload: any = { question: result, index: this.kdData.questions.indexOf(this.chosenRow) };
        this.socket.emit('edit-kd-question', payload, (callback) => {
          console.log(callback.message);
        });
      }
    });
  }
  addQuestion() {
    const dialogRef = this.dialog.open(FormQKdComponent, {
      data: { question: '', answer: '', type: '' }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result) {
        this.socket.emit('add-kd-question', result, (callback) => {
          this.kdData = callback;
        });
      }
    });
  }
  playSfx(sfxId: string) {
    this.socket.emit('play-sfx', sfxId);
  }
  removeQuestion() {
    this.socket.emit('remove-kd-question', this.kdData.questions.indexOf(this.chosenRow), (callback) => {
      console.log(callback.message);
    });
  }
  roundStart(amount: number) {
    this.socket.emit('start-turn-kd', amount);
    this.nextQuestion();
  }
  clockPause() {
    this.socket.emit('play-pause-clock');
  }
  start3sTimer() {
    if (this.lastTurn.name != '') {
      this.socket.emit('start-3s-timer-kd', true)
    }
    else {
      this.socket.emit('start-3s-timer-kd', false)
    }
  }
  goToVCNV() {
    this.router.navigate(['/c-vcnv'])
  }
  resetTurn(){
    this.socket.emit('clear-turn-kd');
    this.lastTurn = {};
  }
  markCorrect() {
    if (this.lastTurn.name != '') {
      this.socket.emit('correct-mark-kd');
      this.socket.emit('stop-3s-timer-kd');
      this.playSfx('KD_CORRECT');
      this.socket.emit('clear-turn-kd');
      this.nextQuestion();
      this.lastTurn.name = '';
    }
  }
  markWrong() {
    if (this.lastTurn.name != '') {
      this.socket.emit('stop-3s-timer-kd');
      this.socket.emit('wrong-mark-kd');
      this.playSfx('KD_WRONG');
      this.socket.emit('clear-turn-kd');
      this.nextQuestion();
      this.lastTurn.name = '';
    }
  }
  nextQuestion() {
    if (this.kdData.questions.indexOf(this.displayingRow) + 1 < this.kdData.questions.length) {
      if (this.currentMaxQuestionNo != 0 && (this.currentQuestionNo != this.currentMaxQuestionNo)) return;
      this.socket.emit('broadcast-kd-question', this.kdData.questions.indexOf(this.displayingRow) + 1, (callback) => {
        console.log(callback.message);
      })
      this.displayingRow = this.kdData.questions[this.kdData.questions.indexOf(this.displayingRow) + 1];
      this.currentQuestionCount += 1;
    }
    else {
      console.log('Last question reached')
    }
  }
  clearQuestion() {
    this.socket.emit('clear-question-kd');
  }
  showPoints() {
    if (this.matchData.matchPos == 'PNTS') {
      this.socket.emit('change-match-position', 'KD');
    }
    else {
      this.socket.emit('change-match-position', 'PNTS');
    }
  }
}
