import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatFabButton } from '@angular/material/button';
import { Role } from '../../core/contracts/api';
import { ChpQuestion, ChpRound } from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';
import { SfxService } from '../../core/services/sfx.service';
import { PlayerListComponent } from '../../components/player-list/player-list.component';

@Component({
  selector: 'app-player-chp',
  templateUrl: './player-chp.component.html',
  styleUrl: './player-chp.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlayerListComponent, MatFabButton],
})
export class PlayerChpComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly sfx = inject(SfxService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly session = inject(SessionService);
  protected readonly Role = Role;

  protected readonly round = signal<ChpRound | null>(null);
  protected readonly question = signal<ChpQuestion | null>(null);
  protected readonly time = signal(0);
  protected readonly turnIndex = signal(-1);
  protected readonly answerButtonDisabled = signal(true);

  protected readonly gotTurn = computed(
    () => this.turnIndex() !== -1 && this.turnIndex() === this.session.playerIndex(),
  );

  /** Eligible to buzz in: this player hasn't used their tiebreak attempt yet. */
  protected readonly canAttempt = computed(() => {
    const index = this.session.playerIndex();
    return index !== null && this.round()?.playedPlayers[index] === false;
  });

  constructor() {
    void this.loadRound();

    const offs = [
      this.network.on<[string]>('play-sfx', (code) => this.sfx.play(code)),
      this.network.on<[ChpQuestion]>('update-chp-question', (data) => this.question.set(data)),
      this.network.on<[number]>('got-turn-chp', (playerIndex) => this.turnIndex.set(playerIndex)),
      this.network.on<[]>('clear-turn-chp', () => this.turnIndex.set(-1)),
      this.network.on<[]>('unlock-button-chp', () => this.answerButtonDisabled.set(false)),
      this.network.on<[]>('lock-button-chp', () => this.answerButtonDisabled.set(true)),
      this.network.on<[number]>('update-clock', (clock) => this.time.set(clock)),
      this.network.on<[ChpRound]>('update-chp-data', (data) => this.round.set(data)),
    ];
    this.destroyRef.onDestroy(() => offs.forEach((off) => off()));
  }

  private async loadRound(): Promise<void> {
    this.round.set(await this.api.getRound('chp'));
  }

  getAnswerTurn(): void {
    this.network.emit('get-turn-chp');
  }
}
