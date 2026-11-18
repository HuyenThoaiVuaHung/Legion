import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import {
  KdQuestion,
  Player,
  RoundDataMap,
  TtQuestion,
  VcnvQuestion,
  VdQuestion,
} from '../core/contracts/game';
import { POSITION_LABELS } from '../core/constants';
import { ApiService } from '../core/services/api.service';
import { MediaService } from '../core/services/media.service';
import { NetworkService } from '../core/services/network.service';
import { SessionService } from '../core/services/session.service';
import { CountdownComponent } from '../components/countdown/countdown.component';
import { PlayerListComponent } from '../components/player-list/player-list.component';

@Component({
  selector: 'app-mc',
  templateUrl: './mc.component.html',
  styleUrl: './mc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlayerListComponent, CountdownComponent, NgClass],
})
export class McComponent {
  private readonly api = inject(ApiService);
  private readonly media = inject(MediaService);
  private readonly network = inject(NetworkService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly session = inject(SessionService);

  readonly kdRound = signal<RoundDataMap['kd'] | null>(null);
  readonly vcnvRound = signal<RoundDataMap['vcnv'] | null>(null);
  readonly ttRound = signal<RoundDataMap['tt'] | null>(null);
  readonly vdRound = signal<RoundDataMap['vd'] | null>(null);
  readonly currentKdQuestion = signal<KdQuestion | null>(null);
  readonly currentVcnvQuestion = signal<VcnvQuestion | null>(null);
  readonly currentTtQuestion = signal<TtQuestion | null>(null);
  readonly currentVdQuestion = signal<VdQuestion | null>(null);
  readonly clockSeconds = signal(0);
  readonly clockPeakSeconds = signal(0);
  readonly kdAnswerTimerTenths = signal(0);
  readonly kdTurnTimerTenths = signal(0);
  readonly kdTurnPlayerIndex = signal<number | null>(null);
  readonly stealingPlayerIndex = signal<number | null>(null);

  readonly players = computed(() => this.session.match()?.players ?? []);
  readonly position = computed(() => this.session.match()?.position ?? 'H');
  readonly positionLabel = computed(() => POSITION_LABELS[this.position()]);
  readonly highlightIndex = computed(() => {
    if (this.position() === 'VD') return this.vdRound()?.activePlayerIndex ?? -1;
    if (this.position() === 'KD' && this.kdRound()?.gamemode === 'S') {
      return this.kdRound()?.activePlayerIndex ?? -1;
    }
    return -1;
  });
  readonly turnIndex = computed(
    () => this.stealingPlayerIndex() ?? this.kdTurnPlayerIndex() ?? -1,
  );
  readonly kdTurnPlayerName = computed(() => {
    const index = this.kdTurnPlayerIndex();
    return index === null ? '' : (this.players()[index]?.name ?? '');
  });
  readonly obstaclePlayers = computed(() => {
    const players = this.players();
    return [...(this.vcnvRound()?.obstacleBuzzes ?? [])]
      .sort((a, b) => a.timestamp - b.timestamp)
      .flatMap((buzz): Player[] => {
        const player = players[buzz.playerIndex];
        return player ? [player] : [];
      });
  });
  readonly vcnvObstacleQuestion = computed(
    () => this.vcnvRound()?.questions.find((question) => question.type === 'CNV') ?? null,
  );
  readonly vcnvObstacleImage = computed(() => {
    const file = this.vcnvObstacleQuestion()?.imageFile;
    return file ? this.media.resolve('vcnv', file) : null;
  });
  readonly clockMaxSeconds = computed(
    () => this.clockPeakSeconds() || this.clockSeconds() || 1,
  );

  constructor() {
    void this.api.getRound('kd').then((round) => this.kdRound.set(round));
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

  vcnvAnswerLength(answer: string): number {
    return answer.split(' ').join('').length;
  }
}
