import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Role } from '../../core/contracts/api';
import { VcnvRound } from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { MediaService } from '../../core/services/media.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';
import { SfxService } from '../../core/services/sfx.service';
import { PlayerListComponent } from '../../components/player-list/player-list.component';

/**
 * VCNV question board is always laid out as 4 hàng ngang rows (index 0-3),
 * one hàng ngang đặc biệt (index 4), and the CNV obstacle itself (index 5)
 * — that structure is fixed by the game rules, not configurable data.
 */
const CNV_INDEX = 5;
const HN_ROW_INDICES = [0, 1, 2, 3] as const;

@Component({
  selector: 'app-player-vcnv-question',
  templateUrl: './player-vcnv-question.component.html',
  styleUrl: './player-vcnv-question.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlayerListComponent, MatFormField, MatInput, FormsModule, MatIconButton, MatIcon, MatFabButton],
})
export class PlayerVcnvQuestionComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly sfx = inject(SfxService);
  private readonly media = inject(MediaService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly session = inject(SessionService);
  protected readonly Role = Role;
  protected readonly hnRowIndices = HN_ROW_INDICES;

  protected readonly round = signal<VcnvRound | null>(null);
  protected readonly currentTime = signal(0);
  protected readonly playerAnswer = signal('');
  protected readonly answerCache = signal('');

  /** The row/obstacle currently being read out — server marks it isShown. */
  protected readonly activeQuestion = computed(
    () => this.round()?.questions.find((q) => q.isShown) ?? null,
  );

  protected readonly cnvImageUrl = computed(() => {
    const cnv = this.round()?.questions[CNV_INDEX];
    return cnv ? this.media.resolve('vcnv', cnv.imageFile) : null;
  });

  protected readonly disabledObstacleButton = computed(() => {
    const index = this.session.playerIndex();
    return index === null || (this.round()?.disabledPlayers.includes(index) ?? false);
  });

  /** Row text: masked with ◯ while closed, ⬤ once shown-but-unsolved, plain once open. */
  protected readonly rowStrings = computed(() => {
    const round = this.round();
    if (!round) return [] as string[];
    return round.questions.map((q) => {
      const clean = q.answer.replace(/\s/g, '').toUpperCase();
      if (q.isOpen) return clean;
      return (q.isShown ? '⬤' : '◯').repeat(clean.length);
    });
  });

  private audio: HTMLAudioElement | null = null;

  constructor() {
    this.network.emit('clear-player-answer');
    void this.loadRound();

    const offs = [
      this.network.on<[string]>('play-sfx', (code) => this.sfx.play(code)),
      this.network.on<[VcnvRound]>('update-vcnv-data', (data) => this.onRound(data)),
      this.network.on<[number]>('update-clock', (clock) => this.currentTime.set(clock)),
    ];
    this.destroyRef.onDestroy(() => offs.forEach((off) => off()));
  }

  private async loadRound(): Promise<void> {
    this.onRound(await this.api.getRound('vcnv'));
  }

  private onRound(data: VcnvRound): void {
    this.round.set(data);
    const active = data.questions.find((q) => q.isShown);
    if (active?.type === 'HN_S') {
      this.audio?.pause();
      this.audio = new Audio(this.media.resolve('vcnv', active.audioFile));
      void this.audio.play();
    } else {
      this.audio?.pause();
      this.audio = null;
    }
  }

  submitAnswer(): void {
    if (this.currentTime() <= 0) return;
    this.answerCache.set(this.playerAnswer().toUpperCase());
    this.network.emit('submit-answer-vcnv', this.playerAnswer());
    this.playerAnswer.set('');
  }

  attemptObstacle(): void {
    this.network.emit('attempt-cnv-player', Date.now());
    this.sfx.play('VCNV_OBSTACLE');
  }

  clearAnswerIfExpired(): void {
    if (this.currentTime() <= 0) this.playerAnswer.set('');
  }
}
