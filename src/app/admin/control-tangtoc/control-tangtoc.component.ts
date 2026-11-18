import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { FormPlayerComponent } from '../../components/forms/form-player/form-player.component';
import { FormQTtComponent } from '../../components/forms/form-q-tt/form-q-tt.component';
import { MenuItemComponent } from '../../components/menu-item/menu-item.component';
import { POSITION_LABELS } from '../../core/constants';
import { Player, TtQuestion, TtRound } from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { MediaService } from '../../core/services/media.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';

/** Sentinel question id the server understands as "hide the question". */
const HIDE_QUESTION_ID = -1;
/** Countdown length while the video question plays. */
const VIDEO_TIMER_SECONDS = 40;

@Component({
  selector: 'app-control-tangtoc',
  templateUrl: './control-tangtoc.component.html',
  styleUrls: ['./control-tangtoc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatCheckbox,
    MatIcon,
    MatSlideToggle,
    MatTableModule,
    MenuItemComponent,
  ],
})
export class ControlTangtocComponent implements OnInit {
  constructor(
    private router: Router,
    public dialog: MatDialog,
    public auth: AuthService,
    private config: ConfigService,
  ) {}
  ifPlayerCNV: boolean = true;
  tangtocData: TtData | undefined;
  currentTime: number = 0;
  displayingRow: TtQuestion | undefined;
  chosenRow: TtQuestion | undefined;
  tangtocMark: boolean[] = [];
  displayedQuestionColumns: string[] = ["id", "question", "answer", "type"];
  displayedPlayerColumns: string[] = [
    "id",
    "name",
    "score",
    "response",
    "timestamp",
    "mark",
    "active",
  ];

  protected readonly round = signal<TtRound | null>(null);
  protected readonly currentTime = signal(0);
  protected readonly chosenRow = signal<TtQuestion | null>(null);
  protected readonly displayingRow = signal<TtQuestion | null>(null);
  /** Replaces the old global config flag: re-show the answer when returning to the question view. */
  protected readonly autoShowAnswer = signal(false);

  protected readonly players = computed(() => this.session.match()?.players ?? []);
  protected readonly positionLabel = computed(() => {
    const position = this.session.match()?.position;
    return position ? POSITION_LABELS[position] : '';
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    for (const off of [
      this.network.on<[TtRound]>('update-tangtoc-data', (data) => this.round.set(data)),
      this.network.on<[number]>('update-clock', (clock) => this.currentTime.set(clock)),
    ]) {
      destroyRef.onDestroy(off);
    }
    void this.init();
  }

  private async init(): Promise<void> {
    const round = await this.api.getRound('tt');
    this.round.set(round);
    if (round.showResults) this.toggleResultsDisplay();
    const position = this.session.match()?.position;
    if (position !== 'TT_Q' && position !== 'TT_A') {
      this.session.match.set(await this.api.setPosition('TT_Q'));
    }
  }
  editQuestion() {
    let question =
      this.tangtocData!.questions[
        this.tangtocData!.questions.findIndex(
          (q) => q.id === this.chosenRow!.id,
        )
      ];
    const dialogRef = this.dialog.open(FormQTtComponent, {
      data: question,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.chosenRow) {
        this.tangtocData!.questions[
          this.tangtocData!.questions.findIndex(
            (q) => q.id === this.chosenRow!.id,
          )
        ] = result;
        this.auth.socket.emit("update-tangtoc-data", this.tangtocData);
      }
    });
  }
  submitMark() {
    this.auth.socket.emit(
      "submit-mark-tangtoc-admin",
      this.tangtocData!.playerAnswers,
    );
    this.round.set({ ...round, playerAnswers });
    void this.saveRound();
  }

  private async saveRound(): Promise<TtRound | null> {
    const round = this.round();
    if (!round) return null;
    const saved = await this.api.putRound('tt', round);
    this.round.set(saved);
    return saved;
  }
  onClickQuestion(row) {
    this.chosenRow = structuredClone(row);
  }
  onDoubleClickQuestion(row) {
    this.displayingRow = structuredClone(row);
  }

  getTimePassed(playerIndex: number): string {
    const round = this.round();
    const answer = round?.playerAnswers[playerIndex];
    if (!round || !answer || answer.timestamp <= 0) return '0s0ms';
    const passedMs = answer.timestamp - round.timerStartTimestamp;
    return `${Math.trunc(passedMs / 1000)}s${passedMs % 1000}ms`;
  }
  hideQuestion() {
    this.auth.socket.emit("broadcast-tt-question", -1);
  }
  startTimer(time: number) {
    this.auth.socket.emit("update-timer-start-timestamp");
    this.playSfx("TT_" + time + "S");
    this.auth.socket.emit("start-clock", time);
  }
  toggleResultsDisplay() {
    this.auth.socket.emit("toggle-results-display-tangtoc");
  }
  toggleAnswerDisplay() {
    if (this.auth.matchData().matchPos == "TT_Q") {
      this.auth.socket.emit("change-match-position", "TT_A");
    } else if (this.auth.matchData().matchPos == "TT_A") {
      this.auth.socket.emit("change-match-position", "TT_Q");
      if (this.config.config().automaticallyShowTangTocAnswer) {
        this.tangtocData!.showAnswer = true;
        this.auth.socket.emit("update-tangtoc-data", this.tangtocData, () => {
          this.auth.socket.emit(
            "broadcast-tt-question",
            this.displayingRow?.id || -1,
          );
        });
      }
      if (this.tangtocData!.showResults == true) this.toggleResultsDisplay();
    }
  }
  togglePlayVideo() {
    this.auth.socket.emit("tangtoc-play-video");
    this.startTimer(30);
  }

  /** Countdown length for an image question, per Olympia pacing. */
  imageTimerSeconds(question: TtQuestion): number {
    return question.id > 2 ? 30 : 20;
  }

  togglePlayVideo(): void {
    this.network.emit('tangtoc-play-video');
    this.startTimer(VIDEO_TIMER_SECONDS);
  }

  toggleResultsDisplay(): void {
    this.network.emit('toggle-results-display-tangtoc');
  }

  pauseClock(): void {
    this.network.emit('play-pause-clock', this.currentTime());
  }

  /** Flips the audience view between the question and the players' answers. */
  async toggleAnswerDisplay(): Promise<void> {
    const position = this.session.match()?.position;
    if (position === 'TT_Q') {
      this.session.match.set(await this.api.setPosition('TT_A'));
      return;
    }
    if (position !== 'TT_A') return;
    this.session.match.set(await this.api.setPosition('TT_Q'));
    if (this.autoShowAnswer()) {
      const round = this.round();
      if (round) {
        this.round.set({ ...round, showAnswer: true });
        await this.saveRound();
        this.network.emit('broadcast-tt-question', this.displayingRow()?.id ?? HIDE_QUESTION_ID);
      }
    }
    if (this.round()?.showResults) this.toggleResultsDisplay();
  }
}
