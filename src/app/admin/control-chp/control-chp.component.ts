import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormPlayerComponent } from '../../components/forms/form-player/form-player.component';
import { FormQchpComponent } from '../../components/forms/form-qchp/form-qchp.component';
import { ChpQuestion, ChpRound, Player } from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-control-chp',
  templateUrl: './control-chp.component.html',
  styleUrls: ['./control-chp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    MatButton,
    MatIconButton,
    MatCheckbox,
    MatIcon,
    MatTableModule,
  ],
})
export class ControlChpComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly dialog = inject(MatDialog);
  protected readonly session = inject(SessionService);

  protected readonly displayedQuestionColumns = ['question', 'answer'];
  protected readonly displayedPlayerColumns = ['id', 'name', 'score', 'active', 'playing'];

  protected readonly round = signal<ChpRound | null>(null);
  protected readonly currentTime = signal(0);
  protected readonly chosenRow = signal<ChpQuestion | null>(null);
  protected readonly displayingRow = signal<ChpQuestion | null>(null);
  /** 0-based index of the player who buzzed in; null when nobody did. */
  protected readonly lastTurnIndex = signal<number | null>(null);

  protected readonly players = computed(() => this.session.match()?.players ?? []);
  protected readonly position = computed(() => this.session.match()?.position ?? 'H');
  protected readonly lastTurnName = computed(() => {
    const index = this.lastTurnIndex();
    return index === null ? '' : (this.players()[index]?.name ?? '');
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    for (const off of [
      this.network.on<[ChpRound]>('update-chp-data', (data) => this.round.set(data)),
      this.network.on<[number]>('update-clock', (clock) => this.currentTime.set(clock)),
      this.network.on<[number]>('got-turn-chp', (playerIndex) =>
        this.lastTurnIndex.set(playerIndex),
      ),
    ]) {
      destroyRef.onDestroy(off);
    }
    void this.init();
  }

  private async init(): Promise<void> {
    this.round.set(await this.api.getRound('chp'));
    this.session.match.set(await this.api.setPosition('CHP'));
  }

  playSfx(sfxId: string): void {
    this.network.emit('play-sfx', sfxId);
  }

  onClickQuestion(row: ChpQuestion): void {
    this.chosenRow.set(row);
  }

  onDoubleClickQuestion(row: ChpQuestion): void {
    const round = this.round();
    if (!round) return;
    this.displayingRow.set(row);
    this.network.emit('broadcast-chp-question', round.questions.indexOf(row));
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
    const dialogRef = this.dialog.open<FormQchpComponent, ChpQuestion, ChpQuestion>(
      FormQchpComponent,
      { data: structuredClone(chosen) },
    );
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      const updated = structuredClone(round);
      updated.questions[index] = result;
      this.round.set(await this.api.putRound('chp', updated));
      this.chosenRow.set(null);
    });
  }

  async setPlayed(playerIndex: number, played: boolean): Promise<void> {
    const round = this.round();
    if (!round) return;
    const playedPlayers = [...round.playedPlayers];
    playedPlayers[playerIndex] = played;
    this.round.set(await this.api.putRound('chp', { ...round, playedPlayers }));
  }

  clockStart(): void {
    this.network.emit('start-timer-chp');
  }

  clockPause(): void {
    this.network.emit('play-pause-clock', this.currentTime());
  }

  markCorrect(): void {
    if (this.lastTurnIndex() === null) return;
    this.network.emit('mark-correct-chp');
    this.lastTurnIndex.set(null);
  }

  markWrong(): void {
    if (this.lastTurnIndex() === null) return;
    this.network.emit('mark-wrong-chp');
    this.lastTurnIndex.set(null);
  }

  clearQuestion(): void {
    this.network.emit('clear-question-chp');
  }
}
