import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RoundDataMap, VdQuestion } from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { ConnectionStatus, NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';

/**
 * VD (Về đích) broadcast overlay: active player, current question and the
 * "Ngôi sao hy vọng" indicator.
 */
@Component({
  selector: 'app-sc-ve-dich',
  templateUrl: './sc-ve-dich.component.html',
  styleUrl: './sc-ve-dich.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
})
export class ScVeDichComponent {
  private readonly session = inject(SessionService);
  private readonly network = inject(NetworkService);
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly players = computed(() => this.session.match()?.players ?? []);
  readonly round = signal<RoundDataMap['vd'] | null>(null);
  readonly currentQuestion = signal<VdQuestion | null>(null);
  readonly stealingPlayerIndex = signal<number | null>(null);
  readonly clockSeconds = signal(0);

  constructor() {
    if (this.network.status() === ConnectionStatus.Disconnected) {
      void this.session.connect(this.network.serverUrl());
    }

    void this.api.getRound('vd').then((round) => this.round.set(round));

    const unsubs = [
      this.network.on<[RoundDataMap['vd']]>('update-vedich-data', (round) => this.round.set(round)),
      this.network.on<[VdQuestion | null]>('update-vedich-question', (question) =>
        this.currentQuestion.set(question ?? null),
      ),
      this.network.on<[number]>('player-steal-question', (playerIndex) =>
        this.stealingPlayerIndex.set(playerIndex),
      ),
      this.network.on<[]>('clear-stealing-player', () => this.stealingPlayerIndex.set(null)),
      this.network.on<[number]>('update-clock', (seconds) => this.clockSeconds.set(seconds)),
    ];
    this.destroyRef.onDestroy(() => unsubs.forEach((unsub) => unsub()));
  }
}
