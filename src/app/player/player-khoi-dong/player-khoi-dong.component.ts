import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ApiService } from '../../core/services/api.service';
import { MediaService } from '../../core/services/media.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';
import { SfxService } from '../../core/services/sfx.service';
import { KdQuestion, KdRound } from '../../core/contracts/game';
import { Role } from '../../core/contracts/api';
import { PlayerListComponent } from '../../components/player-list/player-list.component';

/**
 * Khởi động (warm-up). Question pools/answers live in KdRound (fetched via
 * REST, since it contains every player's answers); the question currently
 * on screen — and who currently holds the buzzer — are transient state the
 * round contract doesn't carry, so the server keeps pushing them over the
 * socket under their legacy event names.
 */
@Component({
  selector: 'app-player-khoi-dong',
  templateUrl: './player-khoi-dong.component.html',
  styleUrl: './player-khoi-dong.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressBar, PlayerListComponent, MatFabButton],
})
export class PlayerKhoiDongComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly sfx = inject(SfxService);
  private readonly media = inject(MediaService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly session = inject(SessionService);
  protected readonly Role = Role;

  protected readonly round = signal<KdRound | null>(null);
  protected readonly question = signal<KdQuestion | null>(null);
  protected readonly previousAnswer = signal<string | null>(null);
  protected readonly turnIndex = signal(-1);
  protected readonly answerButtonDisabled = signal(true);
  protected readonly timerBuzz = signal(0);
  protected readonly timerAnswer = signal(0);

  protected readonly imageUrl = computed(() => {
    const q = this.question();
    if (!q || q.type !== 'P') return null;
    return this.media.resolve('kd', q.mediaFile);
  });

  protected readonly gotTurn = computed(
    () => this.turnIndex() !== -1 && this.turnIndex() === this.session.playerIndex(),
  );

  /** Question count within the current player's turn, derived locally from event order. */
  protected readonly questionNo = signal(0);
  protected readonly maxQuestionNo = computed(() => {
    const round = this.round();
    if (!round) return 0;
    return round.gamemode === 'M'
      ? round.questions.multiplayer.length
      : (round.questions.singleplayer[round.activePlayerIndex]?.length ?? 0);
  });

  private turnKey: string | null = null;
  private audio: HTMLAudioElement | null = null;

  constructor() {
    void this.loadRound();

    const offs = [
      this.network.on<[string, boolean?]>('play-sfx', (code, loop) => this.sfx.play(code, loop)),
      this.network.on<[KdQuestion]>('update-kd-question', (data) => this.onQuestion(data)),
      this.network.on<[number]>('player-got-turn-kd', (playerIndex) => this.turnIndex.set(playerIndex)),
      this.network.on<[]>('clear-turn-player-kd', () => this.turnIndex.set(-1)),
      this.network.on<[]>('enable-answer-button-kd', () => this.answerButtonDisabled.set(false)),
      this.network.on<[]>('disable-answer-button-kd', () => this.answerButtonDisabled.set(true)),
      this.network.on<[]>('stop-kd-sound', () => this.sfx.stopLoop()),
      this.network.on<[number, boolean]>('update-3s-timer-kd', (time, isPlayerTimer) => {
        if (isPlayerTimer) this.timerAnswer.set(time);
        else this.timerBuzz.set(time);
      }),
    ];
    this.destroyRef.onDestroy(() => offs.forEach((off) => off()));
  }

  private async loadRound(): Promise<void> {
    this.round.set(await this.api.getRound('kd'));
  }

  private onQuestion(data: KdQuestion): void {
    this.previousAnswer.set(this.question()?.answer ?? null);
    this.question.set(data);
    this.turnIndex.set(-1);
    this.audio?.pause();
    this.audio = null;
    if (data.type === 'A') {
      this.audio = new Audio(this.media.resolve('kd', data.mediaFile));
      void this.audio.play();
    }

    const round = this.round();
    const key = round ? `${round.gamemode}:${round.activePlayerIndex}` : null;
    this.questionNo.set(key === this.turnKey ? this.questionNo() + 1 : 1);
    this.turnKey = key;

    // Round-level state (gamemode / active podium player) only changes
    // between questions, so a fresh REST fetch here keeps it in sync
    // without a bespoke push event for it.
    void this.loadRound();
  }

  getAnswerTurn(): void {
    this.network.emit('get-turn-kd');
  }
}
