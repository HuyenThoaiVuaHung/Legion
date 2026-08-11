import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormPlayerComponent } from '../../components/forms/form-player/form-player.component';
import { FormQVcnvComponent } from '../../components/forms/form-q-vcnv/form-q-vcnv.component';
import { MenuItemComponent } from '../../components/menu-item/menu-item.component';
import { POSITION_LABELS } from '../../core/constants';
import { Player, VcnvQuestion, VcnvRound } from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { MediaService } from '../../core/services/media.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';

/** Sentinel question id the server understands as "hide all questions". */
const HIDE_QUESTION_ID = 7;
/** Row ids (1-based) revealed when the obstacle is solved. */
const ALL_ROW_IDS = [1, 2, 3, 4, 5];

@Component({
  selector: 'app-control-vcnv',
  templateUrl: './control-vcnv.component.html',
  styleUrls: ['./control-vcnv.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    MenuItemComponent,
  ],
})
export class ControlVcnvComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly dialog = inject(MatDialog);
  protected readonly media = inject(MediaService);
  protected readonly session = inject(SessionService);

  protected readonly displayedQuestionColumns = [
    'id',
    'question',
    'answer',
    'type',
    'value',
    'action',
  ];
  protected readonly displayedPlayerColumns = ['id', 'name', 'score', 'response', 'mark', 'active'];
  protected readonly displayedBuzzColumns = ['id', 'name', 'mark', 'time'];

  protected readonly round = signal<VcnvRound | null>(null);
  protected readonly currentTime = signal(0);
  protected readonly chosenRow = signal<VcnvQuestion | null>(null);
  protected readonly displayingRow = signal<VcnvQuestion | null>(null);
  /** Obstacle marking checkboxes, indexed by player index. */
  protected readonly obstacleMarks = signal<boolean[]>([]);

  protected readonly players = computed(() => this.session.match()?.players ?? []);
  protected readonly positionLabel = computed(() => {
    const position = this.session.match()?.position;
    return position ? POSITION_LABELS[position] : '';
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    for (const off of [
      this.network.on<[VcnvRound]>('update-vcnv-data', (data) => this.round.set(data)),
      this.network.on<[number]>('update-clock', (clock) => this.currentTime.set(clock)),
    ]) {
      destroyRef.onDestroy(off);
    }
    void this.init();
  }

  private async init(): Promise<void> {
    const round = await this.api.getRound('vcnv');
    this.round.set(round);
    // Leftover results overlay from a previous session gets switched off.
    if (round.showResults) this.toggleResultsDisplay();
    const position = this.session.match()?.position;
    if (position !== 'VCNV_Q' && position !== 'VCNV_A') {
      this.session.match.set(await this.api.setPosition('VCNV_Q'));
    }
  }

  playSfx(sfxId: string): void {
    this.network.emit('play-sfx', sfxId);
  }

  onClickQuestion(row: VcnvQuestion): void {
    this.chosenRow.set(row);
  }

  onDoubleClickQuestion(row: VcnvQuestion): void {
    this.displayingRow.set(row);
    this.playSfx('VCNV_CHOOSE_ROW');
    this.network.emit('highlight-vcnv-question', row.id);
  }

  onDoubleClickPlayer(row: Player): void {
    const index = this.players().indexOf(row);
    if (index < 0) return;
    const dialogRef = this.dialog.open(FormPlayerComponent, { data: structuredClone(row) });
    dialogRef.afterClosed().subscribe(async (result?: Player) => {
      if (!result) return;
      result.score = Number(result.score) || 0;
      this.session.match.set(await this.api.updatePlayer(index, result));
    });
  }

  editQuestion(): void {
    const round = this.round();
    const chosen = this.chosenRow();
    if (!round || !chosen) return;
    const index = round.questions.indexOf(chosen);
    if (index < 0) return;
    const dialogRef = this.dialog.open<FormQVcnvComponent, VcnvQuestion, VcnvQuestion>(
      FormQVcnvComponent,
      { data: structuredClone(chosen) },
    );
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      result.value = Number(result.value) || 0;
      const updated = structuredClone(round);
      updated.questions[index] = result;
      this.round.set(await this.api.putRound('vcnv', updated));
      this.chosenRow.set(null);
    });
  }

  /** Persists in-place round edits (marks, isShown toggles). */
  async saveRound(): Promise<void> {
    const round = this.round();
    if (!round) return;
    this.round.set(await this.api.putRound('vcnv', round));
  }

  setAnswerMark(playerIndex: number, correct: boolean): void {
    const round = this.round();
    if (!round) return;
    const playerAnswers = round.playerAnswers.map((answer, i) =>
      i === playerIndex ? { ...answer, correct } : answer,
    );
    this.round.set({ ...round, playerAnswers });
    void this.saveRound();
  }

  setShown(question: VcnvQuestion, isShown: boolean): void {
    const round = this.round();
    if (!round) return;
    const questions = round.questions.map((q) => (q === question ? { ...q, isShown } : q));
    this.round.set({ ...round, questions });
    void this.saveRound();
  }

  setObstacleMark(playerIndex: number, correct: boolean): void {
    this.obstacleMarks.update((marks) => {
      const next = [...marks];
      next[playerIndex] = correct;
      return next;
    });
  }

  submitMark(): void {
    const round = this.round();
    if (!round) return;
    this.network.emit('submit-mark-vcnv-admin', round.playerAnswers);
  }

  submitObstacleMark(): void {
    const marks = this.obstacleMarks();
    this.network.emit('submit-cnv-mark', marks);
    if (marks.some(Boolean)) {
      this.playSfx('VCNV_OBSTACLE_CORRECT');
      for (const id of ALL_ROW_IDS) this.openRow(id);
    } else {
      this.playSfx('VCNV_WRONG_ROW');
    }
  }

  openRow(id: number): void {
    this.network.emit('open-hn-vcnv', id);
  }

  closeRow(id: number): void {
    this.network.emit('close-hn-vcnv', id);
  }

  async resetObstacleBuzzes(): Promise<void> {
    const round = this.round();
    if (!round) return;
    this.round.set(
      await this.api.putRound('vcnv', { ...round, obstacleBuzzes: [], disabledPlayers: [] }),
    );
    this.obstacleMarks.set([]);
  }

  showQuestion(): void {
    const round = this.round();
    const displaying = this.displayingRow();
    if (!round || !displaying) return;
    this.network.emit('broadcast-vcnv-question', displaying.id);
    this.setShown(displaying, true);
  }

  hideQuestion(): void {
    this.network.emit('broadcast-vcnv-question', HIDE_QUESTION_ID);
  }

  start15sTimer(): void {
    this.playSfx('VCNV_15S');
    this.network.emit('start-clock', 15);
  }

  pauseClock(): void {
    this.network.emit('play-pause-clock', this.currentTime());
  }

  toggleResultsDisplay(): void {
    this.network.emit('toggle-results-display-vcnv');
  }

  /** Flips the audience view between the question board and player answers. */
  async toggleAnswerDisplay(): Promise<void> {
    const position = this.session.match()?.position;
    if (position === 'VCNV_Q') {
      this.session.match.set(await this.api.setPosition('VCNV_A'));
    } else if (position === 'VCNV_A') {
      this.session.match.set(await this.api.setPosition('VCNV_Q'));
      if (this.round()?.showResults) this.toggleResultsDisplay();
    }
  }
}
