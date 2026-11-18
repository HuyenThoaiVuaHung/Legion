import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { ChpData, TtData, VcnvData, VdData } from "../services/types/game";
import { Player } from "../services/types/match.data";

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
export class McComponent implements OnInit {
  constructor(public router: Router, public auth: AuthService) {}
  question: any = {};
  currentTime: number = 0;
  maxTime: number = 0;
  vdData?: VdData;
  vcnvData?: VcnvData;
  threeSecTimer1: number = 0;
  threeSecTimer2: number = 0;
  ttData?: TtData;
  chpData?: ChpData;
  kdTurn: any = {};
  imagePath: string = "../../../assets/images/";
  stealingPlayerIndex: number = -1;
  answerCache: string = "";
  ngOnInit(): void {
    this.auth.resetListeners();
    this.auth.socket.on("update-kd-question", (data) => {
      this.answerCache = this.question.answer;
      this.question = data;
    });
    this.auth.socket.on("update-clock", (clock) => {
      if (this.currentTime == 0) {
        this.maxTime = clock;
      }

      this.currentTime = clock;
    });
    this.auth.socket.on("player-got-turn-kd", (player) => {
      this.kdTurn = player;
    });
    this.auth.socket.on("player-steal-question", (id) => {
      this.stealingPlayerIndex = id;
    });
    this.auth.socket.emit("get-vcnv-data", (callback: VcnvData) => {
      this.vcnvData = callback;
      this.imagePath =
        "../../../assets/picture-questions/vcnv/" +
        this.vcnvData.questions[5].picFileName;
    });
    this.auth.socket.emit("get-vedich-data", (callback: VdData) => {
      this.vdData = callback;
    });
    this.auth.socket.on("clear-turn-player-kd", () => {
      this.kdTurn = {};
    });
    this.auth.socket.emit("get-tangtoc-data", (callback: TtData) => {
      this.ttData = callback;
    });
    this.auth.socket.on("next-question", () => {
      this.kdTurn = 0;
    });
    this.auth.socket.on("update-vcnv-question", (question) => {
      this.question = question;
    });
    this.auth.socket.on("update-tangtoc-question", (question) => {
      this.question = question;
    });
    this.auth.socket.on("update-3s-timer-kd", (time, ifPlayer) => {
      if (ifPlayer == true) {
        this.threeSecTimer2 = time;
      } else {
        this.threeSecTimer1 = time;
      }
    });
    this.auth.socket.on("update-vedich-question", (question) => {
      this.question = question;
    });
    this.auth.socket.on("clear-stealing-player", () => {
      this.stealingPlayerIndex = -1;
    });
    this.auth.socket.on("update-vcnv-data", (data: VcnvData) => {
      this.vcnvData = data;
      this.imagePath =
        "../../../assets/picture-questions/vcnv/" +
        this.vcnvData.questions[5].picFileName;
    });
    this.auth.socket.on("update-vedich-data", (data) => {
      this.vdData = data;
    });
    this.auth.socket.on("update-tangtoc-data", (data: TtData) => {
      this.ttData = data;
      this.ttData.playerAnswers.sort(sortByTimestamp);
    });
    this.auth.socket.emit("get-chp-data", (data) => {
      this.chpData = data;
    });
    this.auth.socket.on('update-chp-question', (question) => {
      this.question = question;
    })
    this.auth.socket.on("update-chp-data", (data) => {
      this.chpData = data;
    });

  }
  resolveCnvPlayers(cnvPlayers): Player[] {
    return cnvPlayers.map((player) => this.auth.matchData().players[player.id]);
  }
  counter: number = 0;
  getAnswerTurn() {
    this.auth.socket.emit("get-turn-kd");
    this.auth.socket.emit("start-3s-timer-kd", true);
  }
  passQuestion() {}
  getTimePassed(id: number): string {
    let readableTime = "0s0ms";
    if (this.ttData!.playerAnswers[id].timestamp > 0) {
      let timePassedinMs =
        this.ttData!.playerAnswers[id].timestamp -
        this.ttData!.timerStartTimestamp;
      readableTime =
        Math.trunc(timePassedinMs / 1000) +
        "s" +
        (timePassedinMs % 1000) +
        "ms";
    }
    return readableTime;
  }
  public getVcnvAnswerLength(index: number) {
    return this.vcnvData!.questions[index].answer.split(' ').join("").length;
  }
}

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
