import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { CountdownComponent } from '../components/countdown/countdown.component';
import { PlayerListComponent } from '../components/player-list/player-list.component';
import { POSITION_LABELS } from '../core/constants';
import { KdQuestion, RoundDataMap, TtQuestion, VcnvQuestion, VdQuestion } from '../core/contracts/game';
import { ApiService } from '../core/services/api.service';
import { MediaService } from '../core/services/media.service';
import { NetworkService } from '../core/services/network.service';
import { SessionService } from '../core/services/session.service';

/**
 * MC overview screen: live snapshot of the current round question, player
 * turn/steal state and the running clock, for whoever is hosting the show.
 * Realtime pushes keep the old event names; round data is fetched over REST.
 */
@Component({
  selector: 'app-mc',
  templateUrl: './mc.component.html',
  styleUrl: './mc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlayerListComponent, CountdownComponent, NgClass],
})
export class McComponent {
  private readonly session = inject(SessionService);
  private readonly network = inject(NetworkService);
  private readonly api = inject(ApiService);
  private readonly media = inject(MediaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly match = this.session.match;
  readonly players = computed(() => this.match()?.players ?? []);
  readonly position = computed(() => this.match()?.position ?? null);
  readonly positionLabel = computed(() => {
    const position = this.position();
    return position ? POSITION_LABELS[position] : '';
  });

  readonly clockSeconds = signal(0);
  private readonly clockPeakSeconds = signal(0);

  readonly kdTurnPlayerIndex = signal<number | null>(null);
  readonly kdTurnTimerTenths = signal(0);
  readonly kdAnswerTimerTenths = signal(0);
  readonly stealingPlayerIndex = signal<number | null>(null);
  readonly kdTurnPlayerName = computed(() => {
    const index = this.kdTurnPlayerIndex();
    return index === null ? '' : (this.players()[index]?.name ?? '');
  });

  readonly currentKdQuestion = signal<KdQuestion | null>(null);
  readonly currentVcnvQuestion = signal<VcnvQuestion | null>(null);
  readonly currentTtQuestion = signal<TtQuestion | null>(null);
  readonly currentVdQuestion = signal<VdQuestion | null>(null);

  readonly vcnvRound = signal<RoundDataMap['vcnv'] | null>(null);
  readonly ttRound = signal<RoundDataMap['tt'] | null>(null);
  readonly vdRound = signal<RoundDataMap['vd'] | null>(null);

  /** The obstacle (CNV) row — not always at a fixed index once HN_S rows exist. */
  readonly vcnvObstacleQuestion = computed(
    () => this.vcnvRound()?.questions.find((q) => q.type === 'CNV') ?? null,
  );
  readonly vcnvObstacleImage = computed(() =>
    this.media.resolve('vcnv', this.vcnvObstacleQuestion()?.imageFile),
  );

  /** Contestants who have buzzed in for the obstacle, in buzz-in order. */
  readonly obstaclePlayers = computed(() => {
    const players = this.players();
    return (this.vcnvRound()?.obstacleBuzzes ?? [])
      .map((buzz) => players[buzz.playerIndex])
      .filter((player) => !!player);
  });

  /** Highlight/turn indices fed to the main player list, per active round. */
  readonly highlightIndex = computed(() => this.vdRound()?.activePlayerIndex ?? -1);
  readonly turnIndex = computed(() => {
    switch (this.position()) {
      case 'VD':
        return this.stealingPlayerIndex() ?? -1;
      case 'KD':
        return this.kdTurnPlayerIndex() ?? -1;
      default:
        return -1;
    }
  });

  constructor() {
    void this.api.getRound('vcnv').then((round) => this.vcnvRound.set(round));
    void this.api.getRound('tt').then((round) => this.ttRound.set(round));
    void this.api.getRound('vd').then((round) => this.vdRound.set(round));

    const unsubs = [
      this.network.on<[KdQuestion | null]>('update-kd-question', (question) =>
        this.currentKdQuestion.set(question ?? null),
      ),
      this.network.on<[VcnvQuestion | null]>('update-vcnv-question', (question) =>
        this.currentVcnvQuestion.set(question ?? null),
      ),
      this.network.on<[TtQuestion | null]>('update-tangtoc-question', (question) =>
        this.currentTtQuestion.set(question ?? null),
      ),
      this.network.on<[VdQuestion | null]>('update-vedich-question', (question) =>
        this.currentVdQuestion.set(question ?? null),
      ),
      this.network.on<[RoundDataMap['vcnv']]>('update-vcnv-data', (round) =>
        this.vcnvRound.set(round),
      ),
      this.network.on<[RoundDataMap['tt']]>('update-tangtoc-data', (round) =>
        this.ttRound.set(round),
      ),
      this.network.on<[RoundDataMap['vd']]>('update-vedich-data', (round) =>
        this.vdRound.set(round),
      ),
      this.network.on<[number]>('update-clock', (seconds) => {
        if (this.clockSeconds() === 0) this.clockPeakSeconds.set(seconds);
        this.clockSeconds.set(seconds);
      }),
      this.network.on<[number]>('player-got-turn-kd', (playerIndex) =>
        this.kdTurnPlayerIndex.set(playerIndex),
      ),
      this.network.on<[]>('clear-turn-player-kd', () => this.kdTurnPlayerIndex.set(null)),
      // Old code reset the turn to a bare 0 here, which broke the turn-name
      // lookup on the next render — treat it the same as clearing the turn.
      this.network.on<[]>('next-question', () => this.kdTurnPlayerIndex.set(null)),
      this.network.on<[number, boolean]>('update-3s-timer-kd', (tenths, isAnswerTimer) => {
        if (isAnswerTimer) this.kdAnswerTimerTenths.set(tenths);
        else this.kdTurnTimerTenths.set(tenths);
      }),
      this.network.on<[number]>('player-steal-question', (playerIndex) =>
        this.stealingPlayerIndex.set(playerIndex),
      ),
      this.network.on<[]>('clear-stealing-player', () => this.stealingPlayerIndex.set(null)),
    ];
    this.destroyRef.onDestroy(() => unsubs.forEach((unsub) => unsub()));
  }

  /** Displayed max for the countdown ring; falls back to the live value. */
  readonly clockMaxSeconds = computed(() => this.clockPeakSeconds() || this.clockSeconds() || 1);

  vcnvAnswerLength(answer: string): number {
    return answer.split(' ').join('').length;
  }
}
