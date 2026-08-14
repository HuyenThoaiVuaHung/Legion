import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFabButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { Role } from '../../core/contracts/api';
import { VdQuestion, VdRound } from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { MediaService } from '../../core/services/media.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';
import { SfxService } from '../../core/services/sfx.service';
import { CountdownComponent } from '../../components/countdown/countdown.component';
import { PlayerListComponent } from '../../components/player-list/player-list.component';

/** VD's 6 question slots are always laid out as two rows: 20 điểm, 30 điểm. */
const QUESTION_PICKER_ROWS = [
  { points: 20, indices: [0, 1, 2] },
  { points: 30, indices: [3, 4, 5] },
] as const;

@Component({
  selector: 'app-player-vedich',
  templateUrl: './player-vedich.component.html',
  styleUrl: './player-vedich.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CountdownComponent, PlayerListComponent, MatFabButton, MatCheckbox, FormsModule],
})
export class PlayerVedichComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly sfx = inject(SfxService);
  protected readonly media = inject(MediaService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly session = inject(SessionService);
  protected readonly Role = Role;
  protected readonly pickerRows = QUESTION_PICKER_ROWS;

  protected readonly round = signal<VdRound | null>(null);
  protected readonly currentQuestion = signal<VdQuestion | null>(null);
  protected readonly currentTime = signal(0);
  protected readonly maxTime = signal(0);
  protected readonly fiveSecTimer = signal(0);
  protected readonly stealingPlayerIndex = signal(-1);
  protected readonly buttonDisabled = signal(true);

  protected readonly videoUrl = signal<string | null>(null);
  protected readonly imageUrl = signal<string | null>(null);

  private audio: HTMLAudioElement | null = null;

  constructor() {
    void this.loadRound();

    const offs = [
      this.network.on<[string]>('play-sfx', (code) => this.sfx.play(code)),
      this.network.on<[VdRound]>('update-vedich-data', (data) => this.round.set(data)),
      this.network.on<[VdQuestion | undefined]>('update-vedich-question', (q) => this.onQuestion(q ?? null)),
      this.network.on<[number]>('update-clock', (clock) => this.onClock(clock)),
      this.network.on<[]>('vd-play-video', () => this.toggleVideoPlay()),
      this.network.on<[]>('unlock-button-vd', () => this.buttonDisabled.set(false)),
      this.network.on<[]>('lock-button-vd', () => this.buttonDisabled.set(true)),
      this.network.on<[number]>('update-5s-countdown-vd', (counter) => this.fiveSecTimer.set(counter)),
      this.network.on<[number]>('player-steal-question', (playerIndex) => this.stealingPlayerIndex.set(playerIndex)),
      this.network.on<[]>('clear-stealing-player', () => this.stealingPlayerIndex.set(-1)),
    ];
    this.destroyRef.onDestroy(() => offs.forEach((off) => off()));
  }

  private async loadRound(): Promise<void> {
    this.round.set(await this.api.getRound('vd'));
  }

  private onQuestion(question: VdQuestion | null): void {
    this.currentQuestion.set(question);
    this.audio?.pause();
    this.audio = null;
    this.videoUrl.set(null);
    this.imageUrl.set(null);
    if (!question) return;

    if (question.type === 'V') {
      this.videoUrl.set(this.media.resolve('vd', question.mediaFile));
    } else if (question.type === 'A') {
      this.audio = new Audio(this.media.resolve('vd', question.mediaFile));
      this.audio.load();
      void this.audio.play();
    } else if (question.type === 'I') {
      this.imageUrl.set(this.media.resolve('vd', question.mediaFile));
    }
  }

  private onClock(clock: number): void {
    if (this.currentTime() === 0) this.maxTime.set(clock);
    this.currentTime.set(clock);
  }

  private toggleVideoPlay(): void {
    const video = document.getElementById('vedich-video') as HTMLVideoElement | null;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  stealQuestion(): void {
    this.network.emit('player-steal-question');
  }
}
