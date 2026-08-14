import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { FormPlayerComponent } from '../../components/forms/form-player/form-player.component';
import { FormQKdComponent } from '../../components/forms/form-q-kd/form-q-kd.component';
import { MenuItemComponent } from '../../components/menu-item/menu-item.component';
import { KdGamemode, KdQuestion, KdRound, Player } from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';

/** Question counts per Olympia rules: 6 per singleplayer turn, 12 head-to-head. */
const SINGLEPLAYER_QUESTIONS = 6;
const MULTIPLAYER_QUESTIONS = 12;

@Component({
  selector: 'app-control-khoi-dong',
  templateUrl: './control-khoi-dong.component.html',
  styleUrls: ['./control-khoi-dong.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatCheckbox,
    MatFormField,
    MatLabel,
    MatIcon,
    MatOption,
    MatSelect,
    MatTableModule,
    MatTooltip,
    MenuItemComponent,
  ],
})
export class ControlKhoiDongComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly dialog = inject(MatDialog);
  protected readonly session = inject(SessionService);

  protected readonly displayedQuestionColumns = ['question', 'answer', 'type'];
  protected readonly displayedPlayerColumns = ['id', 'name', 'score', 'active'];
  protected readonly singleplayerQuestions = SINGLEPLAYER_QUESTIONS;
  protected readonly multiplayerQuestions = MULTIPLAYER_QUESTIONS;

  protected readonly round = signal<KdRound | null>(null);
  protected readonly currentTime = signal(0);
  protected readonly chosenRow = signal<KdQuestion | null>(null);
  protected readonly displayingRow = signal<KdQuestion | null>(null);
  protected readonly chosenPlayer = signal<Player | null>(null);
  /** Name of the player who buzzed in ('' when nobody holds the turn). */
  protected readonly lastTurnName = signal('');
  protected readonly maxQuestionNo = signal(0);
  protected readonly currentQuestionNo = signal(0);
  /** [admin countdown, player countdown] seconds. */
  protected readonly threeSecTimers = signal<[number, number]>([0, 0]);

  private questionCount = 0;

  protected readonly players = computed(() => this.session.match()?.players ?? []);

  protected readonly currentQuestionList = computed<KdQuestion[]>(() => {
    const round = this.round();
    if (!round) return [];
    return round.gamemode === 'S'
      ? (round.questions.singleplayer[round.activePlayerIndex] ?? [])
      : round.questions.multiplayer;
  });

  protected readonly currentQuestionListName = computed(() => {
    const round = this.round();
    if (round?.gamemode === 'M') return 'Đối kháng';
    if (round?.gamemode === 'S') {
      const player = this.players()[round.activePlayerIndex];
      return `Cá nhân - Người chơi ${player?.name ?? '?'}`;
    }
    return 'Không xác định';
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    for (const off of [
      this.network.on<[KdRound]>('update-kd-data-admin', (data) => this.round.set(data)),
      this.network.on<[number, number]>('update-number-question-kd', (max, curr) => {
        this.maxQuestionNo.set(max);
        this.currentQuestionNo.set(curr);
      }),
      this.network.on<[number]>('update-clock', (clock) => this.currentTime.set(clock)),
      this.network.on<[number]>('player-got-turn-kd', (playerIndex) =>
        this.lastTurnName.set(this.session.match()?.players[playerIndex]?.name ?? ''),
      ),
      this.network.on('next-question', () => {
        this.nextQuestion();
        this.lastTurnName.set('');
      }),
      this.network.on<[number, boolean]>('update-3s-timer-kd', (timer, isPlayer) => {
        this.threeSecTimers.update(([admin, player]) =>
          isPlayer ? [admin, timer] : [timer, player],
        );
      }),
    ]) {
      destroyRef.onDestroy(off);
    }
    void this.init();
  }

  private async init(): Promise<void> {
    this.round.set(await this.api.getRound('kd'));
    this.session.match.set(await this.api.setPosition('KD'));
  }

  onClickQuestion(row: KdQuestion): void {
    this.chosenRow.set(row);
  }

  onDoubleClickQuestion(row: KdQuestion): void {
    this.displayingRow.set(row);
    this.network.emit('broadcast-kd-question', row);
  }

  choosePlayer(row: Player): void {
    this.chosenPlayer.set(row);
  }

  /** Puts a player on the singleplayer podium. */
  async onDoubleClickPlayer(row: Player): Promise<void> {
    const index = this.players().indexOf(row);
    if (index < 0) return;
    this.round.set(await this.api.patchKdControl({ activePlayerIndex: index }));
  }

  async onGamemodeChange(gamemode: KdGamemode): Promise<void> {
    this.round.set(await this.api.patchKdControl({ gamemode }));
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

  editQuestion(): void {
    const round = this.round();
    const chosen = this.chosenRow();
    if (!round || !chosen) return;
    const questionIndex = this.currentQuestionList().indexOf(chosen);
    if (questionIndex < 0) return;
    const dialogRef = this.dialog.open<FormQKdComponent, KdQuestion, KdQuestion>(
      FormQKdComponent,
      { data: structuredClone(chosen) },
    );
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      const updated = structuredClone(round);
      if (updated.gamemode === 'S') {
        updated.questions.singleplayer[updated.activePlayerIndex][questionIndex] = result;
      } else {
        updated.questions.multiplayer[questionIndex] = result;
      }
      this.round.set(await this.api.putRound('kd', updated));
      this.chosenRow.set(null);
    });
  }

  playSfx(sfxId: string, loop?: boolean): void {
    this.network.emit('play-sfx', sfxId, loop);
  }

  roundStart(amount: number): void {
    this.network.emit('start-turn-kd', amount);
    this.maxQuestionNo.set(amount);
    this.currentQuestionNo.set(0);
    this.questionCount = 0;
    this.playSfx('KD_60S', true);
    this.nextQuestion();
  }

  clockPause(): void {
    this.network.emit('play-pause-clock');
  }

  start3sTimer(): void {
    this.network.emit('start-3s-timer-kd', this.lastTurnName() !== '');
  }

  resetTurn(): void {
    this.network.emit('clear-turn-kd');
    this.lastTurnName.set('');
  }

  markCorrect(): void {
    if (this.lastTurnName() === '' && this.round()?.gamemode !== 'S') return;
    this.network.emit('correct-mark-kd');
    this.network.emit('stop-3s-timer-kd');
    this.playSfx('KD_CORRECT');
    this.network.emit('clear-turn-kd');
    this.nextQuestion();
    this.lastTurnName.set('');
  }

  markWrong(): void {
    if (this.lastTurnName() === '' && this.round()?.gamemode !== 'S') return;
    this.network.emit('stop-3s-timer-kd');
    this.network.emit('wrong-mark-kd');
    this.playSfx('KD_WRONG');
    this.network.emit('clear-turn-kd');
    this.nextQuestion();
    this.lastTurnName.set('');
  }

  nextQuestion(): void {
    if (this.questionCount >= this.maxQuestionNo()) {
      this.network.emit('stop-kd-sound');
      return;
    }
    const next = this.currentQuestionList()[this.questionCount];
    if (!next) return;
    this.displayingRow.set(next);
    this.network.emit('broadcast-kd-question', next);
    this.questionCount += 1;
    this.network.emit('update-number-question-kd', this.maxQuestionNo(), this.questionCount);
  }

  clearQuestion(): void {
    this.network.emit('clear-question-kd');
  }
}
