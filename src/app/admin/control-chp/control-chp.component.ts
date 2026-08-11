import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormPlayerComponent } from 'src/app/components/forms/form-player/form-player.component';
import { FormQchpComponent } from 'src/app/components/forms/form-qchp/form-qchp.component';
import { AuthService } from 'src/app/services/auth.service';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
    selector: 'app-control-chp',
    templateUrl: './control-chp.component.html',
    styleUrls: ['./control-chp.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatButton, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, NgClass, MatIconButton, MatIcon, MatCheckbox, ReactiveFormsModule, FormsModule]
})
export class ControlChpComponent implements OnInit {
  private router = inject(Router);
  dialog = inject(MatDialog);
  auth = inject(AuthService);

  displayingRow: any = null;
  chosenRow: any = null;
  currentTime: number = 0;
  displayedQuestionColumns: string[] = ['question', 'answer'];
  displayedPlayerColumns: string[] = ['id', 'name', 'score', 'active', 'playing'];
  authString: string = '';
  chpData: any = {};
  lastTurn: any = { name: '' };
  threeSecTimers: number[] = [0, 0];
  ngOnInit(): void {
    this.auth.resetListeners();
    this.auth.socket.emit('change-match-position', 'CHP');

    this.auth.socket.on('update-chp-data-admin', (data) => {
      this.chpData = data;
    });
    this.auth.socket.on('update-clock', (clock) => {
      this.currentTime = clock;
    })
    this.auth.socket.emit('get-chp-data', (callback) => {
      this.chpData = callback;
    });
    this.auth.socket.on('disconnect', () => {
      this.auth.socket.emit('leave-match', (this.authString))
    })
    this.auth.socket.on('got-turn-chp', (id) => {
      this.lastTurn = this.auth.matchData().players[id];
    })
  }
  onClickQuestion(row: any) {
    this.chosenRow = row;
  }
  onDoubleClickQuestion(row: any) {
    this.displayingRow = row;
    this.auth.socket.emit('broadcast-chp-question', this.chpData.questions.indexOf(this.displayingRow), callback => {
      console.debug(callback.message);
    });
  }
  onDoubleClickPlayer(row: any) {
    let player = this.auth.matchData().players[this.auth.matchData().players.indexOf(row)];
    const dialogRef = this.dialog.open(FormPlayerComponent, {
      data: player
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        var payload: any = { player: result, index: this.auth.matchData().players.indexOf(row) };
        payload.player.score = parseInt(payload.player.score);
        this.auth.socket.emit('edit-player-info', payload, (callback) => {
          console.debug(callback.message);
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
        this.auth.socket.emit('update-chp-data', this.chpData, (callback) => {
          console.debug(callback.message);
        });
      }
    });
  }
  playSfx(sfxId: string) {
    this.auth.socket.emit('play-sfx', sfxId);
  }
  clockStart() {
    this.auth.socket.emit('start-timer-chp', (callback) => {
      console.debug(callback.message);
    });
  }
  clockPause() {
    this.auth.socket.emit('play-pause-clock', this.currentTime);
  }
  markCorrect() {
    if (this.lastTurn.name != '') {
      this.auth.socket.emit('mark-correct-chp');
      this.lastTurn = { name: '' };
    }
  }
  markWrong() {
    if (this.lastTurn.name != '') {
      this.auth.socket.emit('mark-wrong-chp');
      this.lastTurn = { name: '' };
    }
  }
  clearQuestion() {
    this.auth.socket.emit('clear-question-chp');
  }
  showPoints() {
    if (this.auth.matchData().matchPos == 'PNTS') {
      this.auth.socket.emit('change-match-position', 'CHP');
    }
    else {
      this.auth.socket.emit('change-match-position', 'PNTS');
    }
  }
}
