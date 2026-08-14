import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { TtAnswer, TtRound } from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';
import { SfxService } from '../../core/services/sfx.service';

@Component({
  selector: 'app-player-tangtoc-a',
  templateUrl: './player-tangtoc-a.component.html',
  styleUrl: './player-tangtoc-a.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class PlayerTangtocAComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly sfx = inject(SfxService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly session = inject(SessionService);

  protected readonly round = signal<TtRound | null>(null);

  /** Fastest-first, without mutating the pushed round payload. */
  protected readonly sortedAnswers = computed<TtAnswer[]>(() =>
    [...(this.round()?.playerAnswers ?? [])].sort((a, b) => a.timestamp - b.timestamp),
  );

  private resultsAnnounced = false;

  constructor() {
    this.sfx.play('TT_SHOWANS');
    void this.loadRound();

    const offs = [
      this.network.on<[string]>('play-sfx', (code) => this.sfx.play(code)),
      this.network.on<[TtRound]>('update-tangtoc-data', (data) => this.onRound(data)),
    ];
    this.destroyRef.onDestroy(() => offs.forEach((off) => off()));
  }

  private async loadRound(): Promise<void> {
    this.onRound(await this.api.getRound('tt'));
  }

  private onRound(data: TtRound): void {
    this.round.set(data);
    if (!data.showResults) {
      this.resultsAnnounced = false;
      return;
    }
    if (this.resultsAnnounced) return;
    this.resultsAnnounced = true;
    const anyCorrect = data.playerAnswers.some((a) => a.correct);
    this.sfx.play(anyCorrect ? 'TT_CORRECT' : 'TT_WRONG');
  }

  getTimePassed(answer: TtAnswer): string {
    const round = this.round();
    if (!round || answer.timestamp <= 0) return '0s0ms';
    const elapsedMs = answer.timestamp - round.timerStartTimestamp;
    return `${Math.trunc(elapsedMs / 1000)}s${elapsedMs % 1000}ms`;
  }
}
