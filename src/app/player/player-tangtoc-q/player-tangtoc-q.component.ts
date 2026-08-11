import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Role } from '../../core/contracts/api';
import { TtRound } from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { MediaService } from '../../core/services/media.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';
import { SfxService } from '../../core/services/sfx.service';
import { CountdownComponent } from '../../components/countdown/countdown.component';
import { PlayerListComponent } from '../../components/player-list/player-list.component';

@Component({
  selector: 'app-player-tangtoc-q',
  templateUrl: './player-tangtoc-q.component.html',
  styleUrl: './player-tangtoc-q.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CountdownComponent, PlayerListComponent, MatFormField, MatInput, FormsModule, MatIconButton, MatIcon],
})
export class PlayerTangtocQComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly sfx = inject(SfxService);
  private readonly media = inject(MediaService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly session = inject(SessionService);
  protected readonly Role = Role;

  protected readonly round = signal<TtRound | null>(null);
  protected readonly currentTime = signal(0);
  protected readonly maxTime = signal(0);
  protected readonly playerAnswer = signal('');
  protected readonly answerCache = signal('');
  protected readonly readableTime = signal('');

  protected readonly currentQuestion = computed(() => {
    const round = this.round();
    return round ? (round.questions[round.activeQuestionIndex] ?? null) : null;
  });

  protected readonly imageUrl = computed(() => {
    const q = this.currentQuestion();
    if (!q || q.type !== 'image') return null;
    const round = this.round();
    const name = round?.showAnswer ? q.answerImage : q.questionImage;
    return this.media.resolve('tt', name);
  });

  protected readonly videoUrl = computed(() => {
    const q = this.currentQuestion();
    if (!q || q.type !== 'video') return null;
    return this.media.resolve('tt', q.videoFile);
  });

  protected readonly disabledAnswerBox = computed(() => this.currentTime() <= 0);

  constructor() {
    void this.loadRound();

    const offs = [
      this.network.on<[string]>('play-sfx', (code) => this.sfx.play(code)),
      this.network.on<[TtRound]>('update-tangtoc-data', (data) => this.round.set(data)),
      this.network.on<[number]>('update-clock', (clock) => this.onClock(clock)),
      this.network.on<[]>('tangtoc-play-video', () => this.toggleVideoPlay()),
    ];
    this.destroyRef.onDestroy(() => offs.forEach((off) => off()));
  }

  private async loadRound(): Promise<void> {
    this.round.set(await this.api.getRound('tt'));
  }

  private onClock(clock: number): void {
    if (clock <= 0) {
      this.playerAnswer.set('');
    } else if (this.currentTime() === 0) {
      this.maxTime.set(clock);
    }
    this.currentTime.set(clock);
  }

  private toggleVideoPlay(): void {
    const video = document.getElementById('video-1') as HTMLVideoElement | null;
    if (!video) return;
    video.muted = true;
    if (video.paused) void video.play();
    else video.pause();
  }

  submitAnswer(): void {
    if (this.currentTime() <= 0) return;
    this.network.emit('player-submit-answer-tangtoc', this.playerAnswer());
    this.answerCache.set(this.playerAnswer());
    this.playerAnswer.set('');
    this.updateReadableTime();
  }

  private updateReadableTime(): void {
    const index = this.session.playerIndex();
    if (index === null) return;
    setTimeout(() => {
      const answer = this.round()?.playerAnswers.find((a) => a.playerIndex === index);
      const round = this.round();
      if (!answer || !round) return;
      const elapsedMs = answer.timestamp - round.timerStartTimestamp;
      this.readableTime.set(`${Math.trunc(elapsedMs / 1000)}s${elapsedMs % 1000}ms`);
    }, 200);
  }

  clearAnswerIfExpired(): void {
    if (this.disabledAnswerBox()) this.playerAnswer.set('');
  }
}
