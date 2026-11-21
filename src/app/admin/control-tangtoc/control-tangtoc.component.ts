import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
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
import { CellEdit, EditableTableComponent, TableCellDirective, TableColumn } from '../../components/editable-table/editable-table.component';
import { FormQTtComponent } from '../../components/forms/form-q-tt/form-q-tt.component';
import { MenuItemComponent } from '../../components/menu-item/menu-item.component';
import { POSITION_LABELS } from '../../core/constants';
import { Player, TtQuestion, TtRound } from '../../core/contracts/game';
import { queryParamState } from '../../core/query-param';
import { ApiService } from '../../core/services/api.service';
import { MediaService } from '../../core/services/media.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';

/** Sentinel question id the server understands as "hide the question". */
const HIDE_QUESTION_ID = -1;
/** Countdown length while the video question plays. */
const VIDEO_TIMER_SECONDS = 40;

import { ResizeGroupDirective } from '../../components/resizable/resize-group.directive';

@Component({
  selector: 'app-control-tangtoc',
  templateUrl: './control-tangtoc.component.html',
  styleUrls: ['./control-tangtoc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResizeGroupDirective,
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
    EditableTableComponent,
    TableCellDirective,
    MenuItemComponent,
  ],
})
export class ControlTangtocComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly dialog = inject(MatDialog);
  protected readonly media = inject(MediaService);
  protected readonly session = inject(SessionService);

  protected readonly questionColumns: readonly TableColumn[] = [
    { key: 'id', label: 'ID', flex: 0.5 },
    { key: 'question', label: 'Câu hỏi', flex: 3, edit: 'text' },
    { key: 'answer', label: 'Đáp án', flex: 2, edit: 'text' },
    { key: 'type', label: 'Loại', flex: 1 },
  ];
  protected readonly playerColumns: readonly TableColumn[] = [
    { key: 'id', label: 'ID', flex: 0.5 },
    { key: 'name', label: 'Tên', flex: 2, edit: 'text', sortable: true },
    { key: 'score', label: 'Điểm', flex: 1, edit: 'number', sortable: true, align: 'end' },
    { key: 'response', label: 'Trả lời', flex: 1 },
    { key: 'timestamp', label: 'Thời điểm', flex: 1.5 },
    { key: 'mark', label: 'Chấm', flex: 1.5 },
    { key: 'active', label: 'Đã kết nối?', flex: 1 },
  ];

  protected readonly round = signal<TtRound | null>(null);
  protected readonly currentTime = signal(0);
  protected readonly chosenRow = signal<TtQuestion | null>(null);
  protected readonly displayingRow = signal<TtQuestion | null>(null);
  /** Replaces the old global config flag: re-show the answer when returning to the question view. */
  protected readonly autoShowAnswer = signal(false);


  private readonly selectedQuestion = queryParamState('q');

  private select(row: TtQuestion | null): void {
    this.chosenRow.set(row);
    const index = row ? this.round()?.questions.findIndex((q) => q.id === row.id) ?? -1 : -1;
    this.selectedQuestion.set(index >= 0 ? String(index) : null);
  }

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

    effect(() => {
      const round = this.round();
      const raw = this.selectedQuestion.value();
      if (!round || raw === null) return;
      const row = round.questions[Number(raw)];
      if (row) this.chosenRow.set(row);
    });
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

  playSfx(sfxId: string): void {
    this.network.emit('play-sfx', sfxId);
  }

  onClickQuestion(row: TtQuestion): void {
    this.select(row);
  }

  onDoubleClickQuestion(row: TtQuestion): void {
    this.displayingRow.set(row);
  }

  async saveQuestionCell(edit: CellEdit<TtQuestion>): Promise<void> {
    const round = this.round();
    if (!round) return;
    const updated = structuredClone(round);
    const question = updated.questions.find((q) => q.id === edit.row.id);
    if (!question) return;
    Object.assign(question, { [edit.key]: edit.value });
    this.round.set(await this.api.putRound('tt', updated));
  }

  async savePlayerCell(edit: CellEdit<Player>): Promise<void> {
    this.session.match.set(await this.api.updatePlayer(edit.index, { ...edit.row, [edit.key]: edit.value }));
  }

  editQuestion(): void {
    const round = this.round();
    const chosen = this.chosenRow();
    if (!round || !chosen) return;
    const index = round.questions.findIndex((q) => q.id === chosen.id);
    if (index < 0) return;
    const dialogRef = this.dialog.open<FormQTtComponent, TtQuestion, TtQuestion>(
      FormQTtComponent,
      { data: structuredClone(round.questions[index]) },
    );
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      const updated = structuredClone(round);
      updated.questions[index] = result;
      this.round.set(await this.api.putRound('tt', updated));
      this.select(null);
    });
  }

  setAnswerMark(playerIndex: number, correct: boolean): void {
    const round = this.round();
    if (!round) return;
    const playerAnswers = round.playerAnswers.map((answer, i) =>
      i === playerIndex ? { ...answer, correct } : answer,
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

  submitMark(): void {
    const round = this.round();
    if (!round) return;
    this.network.emit('submit-mark-tangtoc-admin', round.playerAnswers);
  }

  async toggleQuestionAnswer(): Promise<void> {
    const round = this.round();
    if (!round) return;
    this.round.set({ ...round, showAnswer: !round.showAnswer });
    await this.saveRound();
  }

  getTimePassed(playerIndex: number): string {
    const round = this.round();
    const answer = round?.playerAnswers[playerIndex];
    if (!round || !answer || answer.timestamp <= 0) return '0s0ms';
    const passedMs = answer.timestamp - round.timerStartTimestamp;
    return `${Math.trunc(passedMs / 1000)}s${passedMs % 1000}ms`;
  }

  async showQuestion(): Promise<void> {
    const round = this.round();
    const displaying = this.displayingRow();
    if (!round || !displaying) return;
    this.round.set({ ...round, showAnswer: false });
    await this.saveRound();
    this.network.emit('broadcast-tt-question', displaying.id);
    this.playSfx('TT_QUESTION_SHOW');
  }

  hideQuestion(): void {
    this.network.emit('broadcast-tt-question', HIDE_QUESTION_ID);
  }

  startTimer(seconds: number): void {
    this.network.emit('update-timer-start-timestamp');
    this.playSfx(`TT_${seconds}S`);
    this.network.emit('start-clock', seconds);
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
