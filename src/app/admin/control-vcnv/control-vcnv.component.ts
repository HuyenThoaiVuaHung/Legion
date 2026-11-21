import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
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
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { CellEdit, EditableTableComponent, TableCellDirective, TableColumn } from '../../components/editable-table/editable-table.component';
import { FormObstacleComponent } from '../../components/forms/form-obstacle/form-obstacle.component';
import { FormQVcnvComponent } from '../../components/forms/form-q-vcnv/form-q-vcnv.component';
import { MenuItemComponent } from '../../components/menu-item/menu-item.component';
import { POSITION_LABELS } from '../../core/constants';
import { Player, VcnvObstacle, VcnvQuestion, VcnvRound } from '../../core/contracts/game';
import { queryParamState } from '../../core/query-param';
import { ApiService } from '../../core/services/api.service';
import { MediaService } from '../../core/services/media.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';

/** Sentinel question id the server understands as "hide all questions". */
const HIDE_QUESTION_ID = 7;
/** Row ids (1-based) revealed when the obstacle is solved. */
const ALL_ROW_IDS = [1, 2, 3, 4, 5];

import { MatSnackBar } from '@angular/material/snack-bar';
import { uploadObstacleImage } from '../../core/vcnv-image.util';
import { ResizeGroupDirective } from '../../components/resizable/resize-group.directive';

@Component({
  selector: 'app-control-vcnv',
  templateUrl: './control-vcnv.component.html',
  styleUrls: ['./control-vcnv.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResizeGroupDirective,
    MatButton,
    MatIconButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatCheckbox,
    MatIcon,
    MatProgressSpinner,
    EditableTableComponent,
    TableCellDirective,
    MatTooltip,
    MenuItemComponent,
  ],
})
export class ControlVcnvComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly media = inject(MediaService);
  protected readonly session = inject(SessionService);

  protected readonly questionColumns: readonly TableColumn[] = [
    { key: 'id', label: 'ID', flex: 0.5 },
    { key: 'question', label: 'Câu hỏi', flex: 3, edit: 'text' },
    { key: 'answer', label: 'Đáp án', flex: 2, edit: 'text' },
    { key: 'type', label: 'Loại', flex: 1 },
    { key: 'value', label: 'Giá trị', flex: 1, edit: 'number' },
    { key: 'action', label: 'Hành động', flex: 2 },
  ];
  protected readonly playerColumns: readonly TableColumn[] = [
    { key: 'id', label: 'ID', flex: 0.5 },
    { key: 'name', label: 'Tên', flex: 2, edit: 'text', sortable: true },
    { key: 'score', label: 'Điểm', flex: 1, edit: 'number', sortable: true, align: 'end' },
    { key: 'response', label: 'Trả lời', flex: 1 },
    { key: 'mark', label: 'Chấm', flex: 1.5 },
    { key: 'active', label: 'Đã kết nối?', flex: 1 },
  ];
  protected readonly buzzColumns: readonly TableColumn[] = [
    { key: 'id', label: 'ID', flex: 0.5 },
    { key: 'name', label: 'Tên', flex: 2 },
    { key: 'mark', label: 'Chấm', flex: 1.5 },
    { key: 'readableTime', label: 'Thời gian', flex: 1.5 },
  ];

  protected readonly round = signal<VcnvRound | null>(null);
  protected readonly currentTime = signal(0);
  protected readonly chosenRow = signal<VcnvQuestion | null>(null);
  protected readonly displayingRow = signal<VcnvQuestion | null>(null);
  /** Obstacle marking checkboxes, indexed by player index. */
  protected readonly obstacleMarks = signal<boolean[]>([]);


  private readonly selectedQuestion = queryParamState('q');

  private select(row: VcnvQuestion | null): void {
    this.chosenRow.set(row);
    const index = row ? this.round()?.questions.indexOf(row) ?? -1 : -1;
    this.selectedQuestion.set(index >= 0 ? String(index) : null);
  }

  protected readonly uploadingObstacle = signal(false);
  protected readonly obstacleColumns: readonly TableColumn[] = [
    { key: 'question', label: 'Giải thích', flex: 3, edit: 'text' },
    { key: 'answer', label: 'Đáp án', flex: 2, edit: 'text' },
  ];
  protected readonly obstacleRows = computed(() => {
    const obstacle = this.round()?.obstacle;
    return obstacle ? [obstacle] : [];
  });
  protected readonly players = computed(() => this.session.match()?.players ?? []);
  protected readonly positionLabel = computed(() => {
    const position = this.session.match()?.position;
    return position ? POSITION_LABELS[position] : '';
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    for (const off of [
      this.network.on<[VcnvRound]>('update-vcnv-data', (data) => this.round.set(data)),
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
    const round = await this.api.getRound('vcnv');
    this.round.set(round);
    // Leftover results overlay from a previous session gets switched off.
    if (round.showResults) this.toggleResultsDisplay();
    const position = this.session.match()?.position;
    if (position !== 'VCNV_Q' && position !== 'VCNV_A') {
      this.session.match.set(await this.api.setPosition('VCNV_Q'));
    }
  }

  playSfx(sfxId: string): void {
    this.network.emit('play-sfx', sfxId);
  }

  onClickQuestion(row: VcnvQuestion): void {
    this.select(row);
  }

  onDoubleClickQuestion(row: VcnvQuestion): void {
    this.displayingRow.set(row);
    this.playSfx('VCNV_CHOOSE_ROW');
    this.network.emit('highlight-vcnv-question', row.id);
  }

  async saveQuestionCell(edit: CellEdit<VcnvQuestion>): Promise<void> {
    const round = this.round();
    if (!round) return;
    const updated = structuredClone(round);
    const question = updated.questions[edit.index];
    if (!question) return;
    Object.assign(question, { [edit.key]: edit.value });
    this.round.set(await this.api.putRound('vcnv', updated));
  }

  async saveObstacleCell(edit: CellEdit<VcnvObstacle>): Promise<void> {
    const round = this.round();
    if (!round) return;
    const updated = structuredClone(round);
    Object.assign(updated.obstacle, { [edit.key]: edit.value });
    this.round.set(await this.api.putRound('vcnv', updated));
  }

  async onObstacleImage(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const round = this.round();
    input.value = '';
    if (!file || !round) return;
    this.uploadingObstacle.set(true);
    try {
      const updated = structuredClone(round);
      Object.assign(updated.obstacle, await uploadObstacleImage(this.api, file));
      this.round.set(await this.api.putRound('vcnv', updated));
    } catch {
      this.snackBar.open('Không thể tải hoặc xử lý hình ảnh chướng ngại vật.', 'Đóng');
    } finally {
      this.uploadingObstacle.set(false);
    }
  }

  editObstacle(): void {
    const round = this.round();
    if (!round) return;
    const dialogRef = this.dialog.open<FormObstacleComponent, VcnvObstacle, VcnvObstacle>(
      FormObstacleComponent,
      { data: structuredClone(round.obstacle) },
    );
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      const updated = structuredClone(round);
      updated.obstacle = result;
      this.round.set(await this.api.putRound('vcnv', updated));
    });
  }

  async savePlayerCell(edit: CellEdit<Player>): Promise<void> {
    this.session.match.set(await this.api.updatePlayer(edit.index, { ...edit.row, [edit.key]: edit.value }));
  }

  editQuestion(target: VcnvQuestion | null = this.chosenRow()): void {
    const round = this.round();
    if (!round || !target) return;
    const index = round.questions.indexOf(target);
    if (index < 0) return;
    const dialogRef = this.dialog.open<FormQVcnvComponent, VcnvQuestion, VcnvQuestion>(
      FormQVcnvComponent,
      { data: structuredClone(target) },
    );
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      result.value = Number(result.value) || 0;
      const updated = structuredClone(round);
      updated.questions[index] = result;
      this.round.set(await this.api.putRound('vcnv', updated));
      if (target === this.chosenRow()) this.select(null);
    });
  }

  /** Persists in-place round edits (marks, isShown toggles). */
  async saveRound(): Promise<void> {
    const round = this.round();
    if (!round) return;
    this.round.set(await this.api.putRound('vcnv', round));
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

  setShown(question: VcnvQuestion, isShown: boolean): void {
    const round = this.round();
    if (!round) return;
    const questions = round.questions.map((q) => (q === question ? { ...q, isShown } : q));
    this.round.set({ ...round, questions });
    void this.saveRound();
  }

  setObstacleMark(playerIndex: number, correct: boolean): void {
    this.obstacleMarks.update((marks) => {
      const next = [...marks];
      next[playerIndex] = correct;
      return next;
    });
  }

  submitMark(): void {
    const round = this.round();
    if (!round) return;
    this.network.emit('submit-mark-vcnv-admin', round.playerAnswers);
  }

  submitObstacleMark(): void {
    const marks = this.obstacleMarks();
    this.network.emit('submit-cnv-mark', marks);
    if (marks.some(Boolean)) {
      this.playSfx('VCNV_OBSTACLE_CORRECT');
      for (const id of ALL_ROW_IDS) this.openRow(id);
    } else {
      this.playSfx('VCNV_WRONG_ROW');
    }
  }

  openRow(id: number): void {
    this.network.emit('open-hn-vcnv', id);
  }

  closeRow(id: number): void {
    this.network.emit('close-hn-vcnv', id);
  }

  async resetObstacleBuzzes(): Promise<void> {
    const round = this.round();
    if (!round) return;
    this.round.set(
      await this.api.putRound('vcnv', { ...round, obstacleBuzzes: [], disabledPlayers: [] }),
    );
    this.obstacleMarks.set([]);
  }

  showQuestion(): void {
    const round = this.round();
    const displaying = this.displayingRow();
    if (!round || !displaying) return;
    this.network.emit('broadcast-vcnv-question', displaying.id);
    this.setShown(displaying, true);
  }

  hideQuestion(): void {
    this.network.emit('broadcast-vcnv-question', HIDE_QUESTION_ID);
  }

  start15sTimer(): void {
    this.playSfx('VCNV_15S');
    this.network.emit('start-clock', 15);
  }

  pauseClock(): void {
    this.network.emit('play-pause-clock', this.currentTime());
  }

  toggleResultsDisplay(): void {
    this.network.emit('toggle-results-display-vcnv');
  }

  /** Flips the audience view between the question board and player answers. */
  async toggleAnswerDisplay(): Promise<void> {
    const position = this.session.match()?.position;
    if (position === 'VCNV_Q') {
      this.session.match.set(await this.api.setPosition('VCNV_A'));
    } else if (position === 'VCNV_A') {
      this.session.match.set(await this.api.setPosition('VCNV_Q'));
      if (this.round()?.showResults) this.toggleResultsDisplay();
    }
  }
}
