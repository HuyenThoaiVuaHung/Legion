import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormPlayerComponent } from '../../components/forms/form-player/form-player.component';
import { FormQVdComponent } from '../../components/forms/form-q-vd/form-q-vd.component';
import { MenuItemComponent } from '../../components/menu-item/menu-item.component';
import { Player, VdQuestion, VdRound } from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';

/** activePlayerIndex value meaning "no player on the podium". */
const NO_ACTIVE_PLAYER = -1;
/** Sentinel index the server understands as "hide the question". */
const HIDE_QUESTION_INDEX = -1;
/** Slots on the on-screen question picker. */
const QUESTION_PICKER_SLOTS = 6;

@Component({
  selector: 'app-control-vd',
  templateUrl: './control-vd.component.html',
  styleUrls: ['./control-vd.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MenuItemComponent,
  ],
})
export class ControlVdComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly dialog = inject(MatDialog);
  protected readonly session = inject(SessionService);

  protected readonly displayedQuestionColumns = ['question', 'answer', 'type', 'value'];
  protected readonly displayedPlayerColumns = ['id', 'name', 'score', 'active'];
  protected readonly pickerSlots20 = [0, 1, 2];
  protected readonly pickerSlots30 = [3, 4, 5];

  protected readonly round = signal<VdRound | null>(null);
  protected readonly currentTime = signal(0);
  protected readonly chosenRow = signal<VdQuestion | null>(null);
  protected readonly displayingRow = signal<VdQuestion | null>(null);
  protected readonly chosenPlayer = signal<Player | null>(null);
  /** 0-based index of the player who buzzed to steal; null when nobody did. */
  protected readonly stealingPlayerIndex = signal<number | null>(null);

  protected readonly players = computed(() => this.session.match()?.players ?? []);

  protected readonly activePlayer = computed<Player | null>(() => {
    const index = this.round()?.activePlayerIndex ?? NO_ACTIVE_PLAYER;
    return index >= 0 ? (this.players()[index] ?? null) : null;
  });

  protected readonly currentQuestionPool = computed<VdQuestion[]>(() => {
    const round = this.round();
    if (!round || round.activePlayerIndex < 0) return [];
    return round.questionPools[round.activePlayerIndex] ?? [];
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    for (const off of [
      this.network.on<[VdRound]>('update-vedich-data', (data) => this.round.set(data)),
      this.network.on<[number]>('update-clock', (clock) => this.currentTime.set(clock)),
      this.network.on<[number]>('player-steal-question', (playerIndex) => {
        this.playSfx('VD_STEAL_Q');
        this.stealingPlayerIndex.set(playerIndex);
      }),
    ]) {
      destroyRef.onDestroy(off);
    }
    void this.init();
  }

  private async init(): Promise<void> {
    this.round.set(await this.api.getRound('vd'));
    this.session.match.set(await this.api.setPosition('VD'));
  }

  playSfx(sfxId: string): void {
    this.network.emit('play-sfx', sfxId);
  }

  private async saveRound(round: VdRound): Promise<void> {
    this.round.set(await this.api.putRound('vd', round));
  }

  onClickQuestion(row: VdQuestion): void {
    this.chosenRow.set(row);
  }

  onDoubleClickQuestion(row: VdQuestion): void {
    this.displayingRow.set(row);
  }

  choosePlayer(row: Player): void {
    this.chosenPlayer.set(row);
  }

  /** Starts a player's turn: their question pool becomes active. */
  async onDoubleClickPlayer(row: Player): Promise<void> {
    const round = this.round();
    const index = this.players().indexOf(row);
    if (!round || index < 0) return;
    this.chosenRow.set(null);
    this.displayingRow.set(null);
    this.playSfx('VD_START_TURN');
    await this.saveRound({ ...round, activePlayerIndex: index });
  }

  async clearPlayer(): Promise<void> {
    const round = this.round();
    if (!round) return;
    await this.saveRound({ ...round, activePlayerIndex: NO_ACTIVE_PLAYER });
  }

  editPlayer(): void {
    const player = this.chosenPlayer();
    if (!player) return;
    const index = this.players().indexOf(player);
    if (index < 0) return;
    const dialogRef = this.dialog.open(FormPlayerComponent, { data: structuredClone(player) });
    dialogRef.afterClosed().subscribe(async (result?: Player) => {
      if (!result) return;
      result.score = Number(result.score) || 0;
      this.session.match.set(await this.api.updatePlayer(index, result));
    });
  }

  async toggleHopeStar(): Promise<void> {
    const round = this.round();
    if (!round) return;
    if (!round.hopeStarActive) this.playSfx('VD_NSHV');
    await this.saveRound({ ...round, hopeStarActive: !round.hopeStarActive });
  }

  editQuestion(): void {
    const round = this.round();
    const chosen = this.chosenRow();
    if (!round || !chosen || round.activePlayerIndex < 0) return;
    const poolIndex = this.currentQuestionPool().indexOf(chosen);
    if (poolIndex < 0) return;
    const dialogRef = this.dialog.open<FormQVdComponent, VdQuestion, VdQuestion>(
      FormQVdComponent,
      {
        data: structuredClone(chosen),
        minWidth: '700px',
        width: '80vw',
        height: '80vh',
      },
    );
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      result.value = Number(result.value) || 0;
      const updated = structuredClone(round);
      updated.questionPools[updated.activePlayerIndex][poolIndex] = result;
      await this.saveRound(updated);
      this.chosenRow.set(null);
    });
  }

  addQuestion(): void {
    const round = this.round();
    if (!round || round.activePlayerIndex < 0) return;
    const dialogRef = this.dialog.open<FormQVdComponent, Partial<VdQuestion>, VdQuestion>(
      FormQVdComponent,
      {
        data: { question: '', answer: '', value: 0 },
        minWidth: '700px',
        width: '80vw',
        height: '80vh',
      },
    );
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      result.value = Number(result.value) || 0;
      const updated = structuredClone(round);
      updated.questionPools[updated.activePlayerIndex].push(result);
      await this.saveRound(updated);
    });
  }

  async deleteQuestion(): Promise<void> {
    const round = this.round();
    const chosen = this.chosenRow();
    if (!round || !chosen || round.activePlayerIndex < 0) return;
    const poolIndex = this.currentQuestionPool().indexOf(chosen);
    if (poolIndex < 0) return;
    const updated = structuredClone(round);
    updated.questionPools[updated.activePlayerIndex].splice(poolIndex, 1);
    this.chosenRow.set(null);
    this.displayingRow.set(null);
    await this.saveRound(updated);
  }

  async toggleQuestionPicker(): Promise<void> {
    const round = this.round();
    if (!round) return;
    this.playSfx(round.isQuestionPickerShown ? 'VD_CHOSEN' : 'VD_SHOW_PICKER');
    await this.saveRound({ ...round, isQuestionPickerShown: !round.isQuestionPickerShown });
  }

  async clearQuestionPicker(): Promise<void> {
    const round = this.round();
    if (!round) return;
    await this.saveRound({
      ...round,
      pickedQuestions: Array.from({ length: QUESTION_PICKER_SLOTS }, () => false),
    });
  }

  async setPickedQuestion(slot: number, picked: boolean): Promise<void> {
    const round = this.round();
    if (!round) return;
    this.playSfx('VD_CHOOSE');
    const pickedQuestions = [...round.pickedQuestions];
    pickedQuestions[slot] = picked;
    await this.saveRound({ ...round, pickedQuestions });
  }

  showQuestion(): void {
    const displaying = this.displayingRow();
    if (!displaying) return;
    this.network.emit('broadcast-vd-question', this.currentQuestionPool().indexOf(displaying));
  }

  hideQuestion(): void {
    this.network.emit('broadcast-vd-question', HIDE_QUESTION_INDEX);
    this.displayingRow.set(null);
  }

  startTimer(seconds: number): void {
    this.network.emit('start-clock', seconds);
    this.playSfx(`VD_${seconds}S`);
  }

  togglePlayVideo(): void {
    this.network.emit('vd-play-video');
  }

  markCorrect(): void {
    const round = this.round();
    const displaying = this.displayingRow();
    if (!round || !displaying) return;
    this.playSfx('VD_CORRECT');
    const playerIndex = this.stealingPlayerIndex() ?? round.activePlayerIndex;
    this.network.emit('mark-correct-vd', playerIndex, displaying.value);
    this.stealingPlayerIndex.set(null);
  }

  markIncorrect(): void {
    const displaying = this.displayingRow();
    const stealing = this.stealingPlayerIndex();
    if (!displaying || stealing === null) return;
    this.playSfx('VD_WRONG');
    this.network.emit('mark-incorrect-vd', stealing, displaying.value);
    this.stealingPlayerIndex.set(null);
  }

  openStealTurn(): void {
    this.network.emit('start-5s-countdown-vd');
    this.playSfx('VD_5S');
  }

  resetStealTurn(): void {
    this.network.emit('reset-stealing-player');
    this.stealingPlayerIndex.set(null);
  }
}
