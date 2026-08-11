import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { Role } from '../../core/contracts/api';
import { VcnvRound } from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';
import { SfxService } from '../../core/services/sfx.service';

/** VCNV final-guess reveal: every player's obstacle-word answer at once. */
@Component({
  selector: 'app-player-vcnv-answer',
  templateUrl: './player-vcnv-answer.component.html',
  styleUrl: './player-vcnv-answer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatFabButton],
})
export class PlayerVcnvAnswerComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly sfx = inject(SfxService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly session = inject(SessionService);
  protected readonly Role = Role;

  protected readonly round = signal<VcnvRound | null>(null);

  protected readonly disabledObstacleButton = computed(() => {
    const index = this.session.playerIndex();
    return index === null || (this.round()?.disabledPlayers.includes(index) ?? false);
  });

  private resultsAnnounced = false;

  constructor() {
    this.sfx.play('VCNV_SHOWANS');
    void this.loadRound();

    const offs = [
      this.network.on<[string]>('play-sfx', (code) => this.sfx.play(code)),
      this.network.on<[VcnvRound]>('update-vcnv-data', (data) => this.onRound(data)),
    ];
    this.destroyRef.onDestroy(() => offs.forEach((off) => off()));
  }

  private async loadRound(): Promise<void> {
    this.onRound(await this.api.getRound('vcnv'));
  }

  private onRound(data: VcnvRound): void {
    this.round.set(data);
    if (!data.showResults) {
      this.resultsAnnounced = false;
      return;
    }
    if (this.resultsAnnounced) return;
    this.resultsAnnounced = true;
    const anyCorrect = data.playerAnswers.some((a) => a.correct);
    this.sfx.play(anyCorrect ? 'VCNV_CORRECT_ROW' : 'VCNV_WRONG_ROW');
  }

  attemptObstacle(): void {
    this.network.emit('attempt-cnv-player', Date.now());
    this.sfx.play('VCNV_OBSTACLE');
  }
}
