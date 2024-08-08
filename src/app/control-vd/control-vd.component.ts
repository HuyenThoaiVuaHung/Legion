import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormPlayerComponent } from '../form-player/form-player.component';
import { FormQVdComponent } from '../form-q-vd/form-q-vd.component';
import { AuthService } from"../services/auth.service";

@Component({
  selector: 'app-control-vd',
  templateUrl: './control-vd.component.html',
  styleUrls: ['./control-vd.component.scss']
})
export class ControlVdComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    public auth: AuthService,
  ) {
  }
  currentQuestionPool: any = [];
  vdData: any = {};
  currentTime: number = 0;
  displayingRow: any = {};
  chosenRow: any = {};
  currentTurnPlayer: any = {};
  chosenPlayer: any = {};
  playerStoleQuestion: any = undefined;
  displayedQuestionColumns: string[] = ['question', 'answer', 'type', 'value'];
  displayedPlayerColumns: string[] = ['id', 'name', 'score', 'active'];
  ngOnInit(): void {
    this.auth.resetListeners();
    this.auth.socket.emit('change-match-position', 'VD');
    this.auth.socket.on('update-match-data', () => {
      this.currentTurnPlayer = this.auth.matchData().players[this.vdData.currentPlayerId - 1];
    }
    )
    this.auth.socket.on('update-vedich-data', (data) => {
      this.vdData = data;
      this.currentTurnPlayer = this.auth.matchData().players[this.vdData.currentPlayerId - 1];
      switch (this.vdData.currentPlayerId) {
        case 1: this.currentQuestionPool = this.vdData.questionPools[0];
          break;
        case 2: this.currentQuestionPool = this.vdData.questionPools[1];
          break;
        case 3: this.currentQuestionPool = this.vdData.questionPools[2];
          break;
        case 4: this.currentQuestionPool = this.vdData.questionPools[3];
          break;
        default: this.currentQuestionPool = [];
          break;
      }
    });
    this.auth.socket.on('update-clock', (clock) => {
      this.currentTime = clock;
    })
    this.auth.socket.on('player-steal-question', (id) => {
      this.playSfx('VD_STEAL_Q');
      this.playerStoleQuestion = this.auth.matchData().players[id];
    })
    this.auth.socket.emit('get-vedich-data', (callback) => {
      this.vdData = callback;
      this.currentTurnPlayer = this.auth.matchData().players[this.vdData.currentPlayerId - 1];
      switch (this.vdData.currentPlayerId) {
        case 1: this.currentQuestionPool = this.vdData.questionPools[0];
          break;
        case 2: this.currentQuestionPool = this.vdData.questionPools[1];
          break;
        case 3: this.currentQuestionPool = this.vdData.questionPools[2];
          break;
        case 4: this.currentQuestionPool = this.vdData.questionPools[3];
          break;
        default: this.currentQuestionPool = [];
          break;
      }
    });
  }



  onDoubleClickPlayer(row: any) {
    this.currentTurnPlayer = row;
    this.vdData.currentPlayerId = row.id;
    this.chosenRow = {};
    this.displayingRow = {};
    this.playSfx('VD_START_TURN');
    this.auth.socket.emit('update-vedich-data', this.vdData);
  }
  editPlayer() {
    let player = this.auth.matchData().players[this.auth.matchData().players.indexOf(this.chosenPlayer)];
    const dialogRef = this.dialog.open(FormPlayerComponent, {
      data: player
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        var payload: any = { player: result, index: this.auth.matchData().players.indexOf(this.chosenPlayer) };
        payload.player.score = parseInt(payload.player.score);
        this.auth.socket.emit('edit-player-info', payload, (callback) => {
        });
      }
    });
  }
  toggleNSHV() {
    if (this.vdData.ifNSHV == false) this.playSfx('VD_NSHV');
    this.vdData.ifNSHV = !this.vdData.ifNSHV;
    this.auth.socket.emit('update-vedich-data', this.vdData);
  }
  choosePlayer(row: any) {
    this.chosenPlayer = row;
  }
  playSfx(sfxId: string) {
    this.auth.socket.emit('play-sfx', sfxId);
  }
  editQuestion() {
    let question = this.currentQuestionPool[this.currentQuestionPool.indexOf(this.chosenRow)];
    question.value = question.value.toString();
    const dialogRef = this.dialog.open(FormQVdComponent, {
      data: question
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vdData.questionPools[this.vdData.currentPlayerId - 1][this.vdData.questionPools[this.vdData.currentPlayerId - 1].indexOf(this.chosenRow)] = result;
        this.vdData.questionPools[this.vdData.currentPlayerId - 1][this.vdData.questionPools[this.vdData.currentPlayerId - 1].indexOf(this.chosenRow)].value = Number.parseInt(result.value);
        this.auth.socket.emit('update-vedich-data', this.vdData);
      }
    });
  }
  updateVdData() {
    this.auth.socket.emit('update-vedich-data', this.vdData);
  }
  clearPlayer() {
    this.vdData.currentPlayerId = 0;
    this.currentTurnPlayer = {};
    this.auth.socket.emit('update-vedich-data', this.vdData);
  }
  toggleQuestionPicker() {
    if (this.vdData.ifQuestionPickerShowing == true) {
      this.playSfx('VD_CHOSEN');
      this.vdData.ifQuestionPickerShowing = false;
    }
    else {
      this.playSfx('VD_SHOW_PICKER');
      this.vdData.ifQuestionPickerShowing = true;
    }
    this.auth.socket.emit('update-vedich-data', this.vdData);
  }
  clearQuestionPicker() {
    this.vdData.questionPickerArray = [false, false, false, false, false, false];
    this.auth.socket.emit('update-vedich-data', this.vdData);
  }
  addQuestion() {
    const dialogRef = this.dialog.open(FormQVdComponent, {
      data: {
        question: '',
        answer: '',
        value: 0,
        type: '',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let payload = result;
        payload.value = +payload.value;
        this.vdData.questionPools[this.vdData.currentPlayerId - 1].push(payload);
        this.auth.socket.emit('update-vedich-data', this.vdData);
      }
    });
  }
  deleteQuestion() {
    this.vdData.questionPools[this.vdData.currentPlayerId - 1].splice(this.vdData.questionPools[this.vdData.currentPlayerId - 1].indexOf(this.chosenRow), 1);
    this.chosenRow = {};
    this.displayingRow = {};
    this.auth.socket.emit('update-vedich-data', this.vdData);
  }
  onClickQuestion(row) {
    this.chosenRow = row;
  }
  onDoubleClickQuestion(row) {
    this.displayingRow = row;
  }
  showQuestion() {
    this.auth.socket.emit('broadcast-vd-question', this.currentQuestionPool.indexOf(this.displayingRow));
  }
  hideQuestion() {
    this.auth.socket.emit('broadcast-vd-question', -1);
    this.displayingRow = {};
  }
  startTimer(time: number) {
    this.auth.socket.emit('start-clock', time);
    this.playSfx('VD_' + time + 'S');
  }
  togglePlayVideo() {
    this.auth.socket.emit('vd-play-video');
  }
  markCorrect() {
    this.playSfx('VD_CORRECT');
    if (this.playerStoleQuestion != undefined) {
      this.auth.socket.emit('mark-correct-vd', this.playerStoleQuestion.id, this.displayingRow.value);
    }
    else {
      this.auth.socket.emit('mark-correct-vd', this.vdData.currentPlayerId, this.displayingRow.value);
    }
    this.playerStoleQuestion = undefined;
  }
  markIncorrect() {
    this.playSfx('VD_WRONG');
    if (this.playerStoleQuestion != undefined) {
      this.auth.socket.emit('mark-incorrect-vd', this.playerStoleQuestion.id, this.displayingRow.value);
    }
    this.playerStoleQuestion = undefined;
  }
  openStealTurn() {
    this.auth.socket.emit('start-5s-countdown-vd');
    this.playSfx('VD_5S');
  }
  showPoints() {
    if (this.auth.matchData().matchPos == 'PNTS') {
      this.auth.socket.emit('change-match-position', 'VD');
    }
    else {
      this.auth.socket.emit('change-match-position', 'PNTS');
    }
  }
}
