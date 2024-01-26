import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormPlayerComponent } from '../form-player/form-player.component';
import { FormQTtComponent } from '../form-q-tt/form-q-tt.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-control-tangtoc',
  templateUrl: './control-tangtoc.component.html',
  styleUrls: ['./control-tangtoc.component.scss']
})
export class ControlTangtocComponent implements OnInit {

  constructor(
    private router: Router,
    public dialog: MatDialog,
    public auth: AuthService
  ) {

  }
  ifPlayerCNV: boolean = true;
  tangtocData: any = {};
  currentTime: number = 0;
  displayingRow: any = {};
  chosenRow: any = {};
  tangtocMark: boolean[] = [];
  displayedQuestionColumns: string[] = ['id', 'question', 'answer', 'type'];
  displayedPlayerColumns: string[] = ['id', 'name', 'score', 'response', 'timestamp', 'mark', 'active'];
  ngOnInit(): void {
    this.auth.resetListeners();
    if (this.auth.matchData.matchPos != 'TT_Q' && this.auth.matchData.matchPos != 'TT_A') {
      this.auth.socket.emit('change-match-position', 'TT_Q');
    }
    this.auth.socket.on('update-match-data', (data) => {
      this.auth.matchData = data;
    }
    )
    this.auth.socket.on('update-tangtoc-data', (data) => {
      this.tangtocData = data;
    });
    this.auth.socket.on('update-clock', (clock) => {
      this.currentTime = clock;
    })
    this.auth.socket.emit('get-tangtoc-data', (callback) => {
      this.tangtocData = callback;
      if (this.tangtocData.showResults == true) this.toggleResultsDisplay();
    });
  }

  onDoubleClickPlayer(row: any) {
    let player = this.auth.matchData.players[this.auth.matchData.players.indexOf(row)];
    const dialogRef = this.dialog.open(FormPlayerComponent, {
      data: player
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        var payload: any = { player: result, index: this.auth.matchData.players.indexOf(row) };
        payload.player.score = parseInt(payload.player.score);
        this.auth.socket.emit('edit-player-info', payload, (callback) => {
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
        this.auth.socket.emit('update-tangtoc-data', this.tangtocData);
      }
    });
  }
  submitMark() {
    this.auth.socket.emit('submit-mark-tangtoc-admin', this.tangtocData.playerAnswers);
  }
  playSfx(sfxId: string) {
    this.auth.socket.emit('play-sfx', sfxId);
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
    this.auth.socket.emit('update-tangtoc-data', this.tangtocData);
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
    this.auth.socket.emit('update-tangtoc-data', this.tangtocData);
    this.auth.socket.emit('broadcast-tt-question', this.displayingRow.id);
    if (this.tangtocData.showAnswer == false) {
      this.playSfx('TT_QUESTION_SHOW')
    }
  }
  hideQuestion() {
    this.auth.socket.emit('broadcast-tt-question', -1);
  }
  startTimer(time: number) {
    this.auth.socket.emit('update-timer-start-timestamp');
    this.playSfx('TT_' + time + 'S');
    this.auth.socket.emit('start-clock', time);
  }
  toggleResultsDisplay() {
    this.auth.socket.emit('toggle-results-display-tangtoc');
  }
  toggleAnswerDisplay() {
    if (this.auth.matchData.matchPos == 'TT_Q') {
      this.auth.socket.emit('change-match-position', 'TT_A');
    }
    else if (this.auth.matchData.matchPos == 'TT_A') {
      this.auth.socket.emit('change-match-position', 'TT_Q');
      if (this.tangtocData.showResults == true) this.toggleResultsDisplay();
    }
  }
  togglePlayVideo() {
    this.auth.socket.emit('tangtoc-play-video');
    this.startTimer(40);
  }
  goToVD() {
    this.router.navigate(['/c-vd']);
  }
  showPoints() {
    if (this.auth.matchData.matchPos == 'PNTS') {
      this.auth.socket.emit('change-match-position', 'TT_Q');
    }
    else {
      this.auth.socket.emit('change-match-position', 'PNTS');
    }
  }
}
