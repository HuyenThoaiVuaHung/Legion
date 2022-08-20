import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { FormPlayerComponent } from '../form-player/form-player.component';
import { FormQKdComponent } from '../form-q-kd/form-q-kd.component';
import { FormQTtComponent } from '../form-q-tt/form-q-tt.component';
import { FormQVcnvComponent } from '../form-q-vcnv/form-q-vcnv.component';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-control-tangtoc',
  templateUrl: './control-tangtoc.component.html',
  styleUrls: ['./control-tangtoc.component.scss']
})
export class ControlTangtocComponent implements OnInit {

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private service: CommonService
  ) {

  }
  ifPlayerCNV: boolean = true;
  socket = io(environment.socketIp);
  tangtocData: any = {};
  matchData: any = {};
  currentTime: number = 0;
  authString: string = '';
  displayingRow: any = {};
  chosenRow: any = {};
  tangtocMark: boolean[] = [];
  displayedQuestionColumns: string[] = ['id', 'question', 'answer', 'type'];
  displayedPlayerColumns: string[] = ['id', 'name', 'score', 'response', 'timestamp', 'mark', 'active'];
  ngOnInit(): void {
    this.authString = localStorage.getItem('authString') || '';
    console.log(this.authString);
    this.socket.emit('init-authenticate', this.authString, (callback) => {
      this.service.changeData(callback.roleId);
      if (callback.roleId == 1) {
        console.log('Logged in as admin');
        if (callback.matchData.matchPos != 'TT_Q' && callback.matchData.matchPos != 'TT_A') {
          this.socket.emit('change-match-position', 'TT_Q');
        }
        this.matchData = callback.matchData;
        this.socket.on('update-match-data', (data) => {
          this.matchData = data;
        }
        )
        this.socket.on('update-tangtoc-data', (data) => {
          this.tangtocData = data;
        });
        this.socket.on('update-clock', (clock) => {
          this.currentTime = clock;
        })
        this.socket.emit('get-tangtoc-data', (callback) => {
          this.tangtocData = callback;
        });
        this.socket.on('disconnect', () => {
          this.socket.emit('leave-match', (this.authString))
        })
      }
      else {
        console.log('Wrong token');
        this.router.navigate(['/']);
      }
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
    let question = this.tangtocData.questions[this.tangtocData.questions.indexOf(this.chosenRow)];
    const dialogRef = this.dialog.open(FormQTtComponent, {
      data: question
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tangtocData.questions[this.tangtocData.questions.indexOf(this.chosenRow)] = result;
        this.socket.emit('update-tangtoc-data', this.tangtocData);
      }
    });
  }
  submitMark() {
    this.socket.emit('submit-mark-tangtoc-admin', this.tangtocData.playerAnswers);
  }
  playSfx(sfxId: string) {
    this.socket.emit('play-sfx', sfxId);
  }
  onClickQuestion(row) {
    this.chosenRow = row;
  }
  onDoubleClickQuestion(row) {
    this.displayingRow = row;
  }
  toggleQuestionAnswer() {
    if (this.tangtocData.showAnswer == true) {
      this.tangtocData.showAnswer = false;
    }
    else {
      this.tangtocData.showAnswer = true;
    }
    this.socket.emit('update-tangtoc-data', this.tangtocData);
  }
  getTimePassed(id: number): string {
    let readableTime = '0s0ms';
    if (this.tangtocData.playerAnswers[id].timestamp > 0) {
      let timePassedinMs = this.tangtocData.playerAnswers[id].timestamp - this.tangtocData.timerStartTimestamp;
      readableTime = Math.trunc(timePassedinMs / 1000) + 's' + timePassedinMs % 1000 + 'ms';
    }
    return readableTime;
  }
  showQuestion() {
    this.tangtocData.showAnswer = false;
    this.socket.emit('update-tangtoc-data', this.tangtocData);
    this.socket.emit('broadcast-tt-question', this.displayingRow.id);
    if (this.tangtocData.showAnswer == false){
      this.playSfx('TT_QUESTION_SHOW')
    }
  }
  hideQuestion() {
    this.socket.emit('broadcast-tt-question', -1);
  }
  startTimer(time: number) {
    this.socket.emit('update-timer-start-timestamp');
    this.playSfx('TT_' + time + 'S');
    this.socket.emit('start-clock', time);
  }
  toggleResultsDisplay() {
    this.socket.emit('toggle-results-display-tangtoc');
  }
  toggleAnswerDisplay() {
    if (this.matchData.matchPos == 'TT_Q') {
      this.socket.emit('change-match-position', 'TT_A');
    }
    else if (this.matchData.matchPos == 'TT_A') {
      this.socket.emit('change-match-position', 'TT_Q');
    }
  }
  togglePlayVideo() {
    this.socket.emit('tangtoc-play-video');
    this.playSfx('TT_40S');
    this.startTimer(40);
  }
  goToVD() {
    this.router.navigate(['/c-vd']);
  }
  showPoints() {
    if (this.matchData.matchPos == 'PNTS') {
      this.socket.emit('change-match-position', 'TT_Q');
    }
    else {
      this.socket.emit('change-match-position', 'PNTS');
    }
  }
}
