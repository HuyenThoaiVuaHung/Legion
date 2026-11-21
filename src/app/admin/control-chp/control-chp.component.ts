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
import { CellEdit, EditableTableComponent, TableCellDirective, TableColumn } from '../../components/editable-table/editable-table.component';
import { FormQchpComponent } from '../../components/forms/form-qchp/form-qchp.component';
import { MenuItemComponent } from '../../components/menu-item/menu-item.component';
import { ChpQuestion, ChpRound, Player } from '../../core/contracts/game';
import { queryParamState } from '../../core/query-param';
import { ApiService } from '../../core/services/api.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';

import { ResizeGroupDirective } from '../../components/resizable/resize-group.directive';

@Component({
  selector: 'app-control-chp',
  templateUrl: './control-chp.component.html',
  styleUrls: ['./control-chp.component.scss'],
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
    EditableTableComponent,
    TableCellDirective,
    MenuItemComponent,
  ],
})
export class ControlChpComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly dialog = inject(MatDialog);
  protected readonly session = inject(SessionService);

  protected readonly questionColumns: readonly TableColumn[] = [
    { key: 'question', label: 'Câu hỏi', flex: 3, edit: 'text' },
    { key: 'answer', label: 'Đáp án', flex: 2, edit: 'text' },
    { key: 'shown', label: 'Đang hiện', flex: 1 },
  ];
  protected readonly playerColumns: readonly TableColumn[] = [
    { key: 'id', label: 'ID', flex: 0.5 },
    { key: 'name', label: 'Tên', flex: 2, edit: 'text', sortable: true },
    { key: 'score', label: 'Điểm', flex: 1, edit: 'number', sortable: true, align: 'end' },
    { key: 'active', label: 'Đã kết nối?', flex: 1 },
    { key: 'playing', label: 'Đã chơi', flex: 1 },
  ];

  protected readonly round = signal<ChpRound | null>(null);
  protected readonly currentTime = signal(0);
  protected readonly chosenRow = signal<ChpQuestion | null>(null);
  protected readonly displayingRow = signal<ChpQuestion | null>(null);
  /** 0-based index of the player who buzzed in; null when nobody did. */
  protected readonly lastTurnIndex = signal<number | null>(null);


  private readonly selectedQuestion = queryParamState('q');

  private select(row: ChpQuestion | null): void {
    this.chosenRow.set(row);
    const index = row ? this.round()?.questions.indexOf(row) ?? -1 : -1;
    this.selectedQuestion.set(index >= 0 ? String(index) : null);
  }

  protected readonly players = computed(() => this.session.match()?.players ?? []);
  protected readonly position = computed(() => this.session.match()?.position ?? 'H');
  protected readonly lastTurnName = computed(() => {
    const index = this.lastTurnIndex();
    return index === null ? '' : (this.players()[index]?.name ?? '');
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    for (const off of [
      this.network.on<[ChpRound]>('update-chp-data', (data) => this.round.set(data)),
      this.network.on<[number]>('update-clock', (clock) => this.currentTime.set(clock)),
      this.network.on<[number]>('got-turn-chp', (playerIndex) =>
        this.lastTurnIndex.set(playerIndex),
      ),
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
    this.round.set(await this.api.getRound('chp'));
    this.session.match.set(await this.api.setPosition('CHP'));
  }

  playSfx(sfxId: string): void {
    this.network.emit('play-sfx', sfxId);
  }

  onClickQuestion(row: ChpQuestion): void {
    this.select(row);
  }

  onDoubleClickQuestion(row: ChpQuestion): void {
    const round = this.round();
    if (!round) return;
    this.displayingRow.set(row);
    this.network.emit('broadcast-chp-question', round.questions.indexOf(row));
  }

  async saveQuestionCell(edit: CellEdit<ChpQuestion>): Promise<void> {
    const round = this.round();
    if (!round) return;
    const updated = structuredClone(round);
    const question = updated.questions[edit.index];
    if (!question) return;
    Object.assign(question, { [edit.key]: edit.value });
    this.round.set(await this.api.putRound('chp', updated));
  }

  async savePlayerCell(edit: CellEdit<Player>): Promise<void> {
    this.session.match.set(await this.api.updatePlayer(edit.index, { ...edit.row, [edit.key]: edit.value }));
  }

  editQuestion(): void {
    const round = this.round();
    const chosen = this.chosenRow();
    if (!round || !chosen) return;
    const index = round.questions.indexOf(chosen);
    if (index < 0) return;
    const dialogRef = this.dialog.open<FormQchpComponent, ChpQuestion, ChpQuestion>(
      FormQchpComponent,
      { data: structuredClone(chosen) },
    );
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      const updated = structuredClone(round);
      updated.questions[index] = result;
      this.round.set(await this.api.putRound('chp', updated));
      this.select(null);
    });
  }

  async setPlayed(playerIndex: number, played: boolean): Promise<void> {
    const round = this.round();
    if (!round) return;
    const playedPlayers = [...round.playedPlayers];
    playedPlayers[playerIndex] = played;
    this.round.set(await this.api.putRound('chp', { ...round, playedPlayers }));
  }

  clockStart(): void {
    this.network.emit('start-timer-chp');
  }

  clockPause(): void {
    this.network.emit('play-pause-clock', this.currentTime());
  }

  markCorrect(): void {
    if (this.lastTurnIndex() === null) return;
    this.network.emit('mark-correct-chp');
    this.lastTurnIndex.set(null);
  }

  markWrong(): void {
    if (this.lastTurnIndex() === null) return;
    this.network.emit('mark-wrong-chp');
    this.lastTurnIndex.set(null);
  }

  resetTurn(): void {
    this.network.emit('clear-turn-chp');
    this.lastTurnIndex.set(null);
  }

  clearQuestion(): void {
    this.network.emit('clear-question-chp');
  }
}
