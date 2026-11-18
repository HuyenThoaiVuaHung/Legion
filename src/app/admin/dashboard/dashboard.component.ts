import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import * as XLSX from 'xlsx';
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
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { NgClass } from '@angular/common';
import { FormPlayerComponent } from '../../components/forms/form-player/form-player.component';
import { FormQKdComponent } from '../../components/forms/form-q-kd/form-q-kd.component';
import { FormQTtComponent } from '../../components/forms/form-q-tt/form-q-tt.component';
import { FormQVcnvComponent } from '../../components/forms/form-q-vcnv/form-q-vcnv.component';
import { FormQVdComponent } from '../../components/forms/form-q-vd/form-q-vd.component';
import { FormQchpComponent } from '../../components/forms/form-qchp/form-qchp.component';
import { MenuItemComponent } from '../../components/menu-item/menu-item.component';
import {
  ChpQuestion,
  ChpRound,
  KdGamemode,
  KdQuestion,
  KdRound,
  Player,
  RoundKind,
  TtQuestion,
  TtRound,
  VcnvQuestion,
  VcnvRound,
  VdQuestion,
  VdRound,
} from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { MediaService } from '../../core/services/media.service';
import { NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';
import { QuestionPreview, toQuestionPreview } from '../utils/question.adapter';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
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
    MatFormField,
    MatLabel,
    MatIcon,
    MatOption,
    MatSelect,
    MatTableModule,
    MenuItemComponent,
  ],
})
export class AdminDashboardComponent {
  private readonly api = inject(ApiService);
  private readonly network = inject(NetworkService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly media = inject(MediaService);
  protected readonly session = inject(SessionService);

  protected readonly displayedQuestionColumns = ['question', 'answer', 'type'];
  protected readonly displayedPlayerColumns = ['id', 'name', 'score', 'active'];

  protected readonly kdRound = signal<KdRound | null>(null);
  protected readonly vcnvRound = signal<VcnvRound | null>(null);
  protected readonly ttRound = signal<TtRound | null>(null);
  protected readonly vdRound = signal<VdRound | null>(null);
  protected readonly chpRound = signal<ChpRound | null>(null);

  protected readonly selectedKind = signal<RoundKind>('kd');
  /** Preview-only selections; they never touch the server. */
  protected readonly kdPreviewGamemode = signal<KdGamemode>('S');
  protected readonly kdPreviewPlayerIndex = signal(0);
  protected readonly vdPreviewPlayerIndex = signal(-1);

  protected readonly chosenRow = signal<QuestionPreview | null>(null);
  protected readonly importedFileName = signal('');

  protected readonly players = computed(() => this.session.match()?.players ?? []);

  protected readonly questionList = computed<QuestionPreview[]>(() => {
    const kind = this.selectedKind();
    const questions = (() => {
      switch (kind) {
        case 'kd': {
          const round = this.kdRound();
          if (!round) return [];
          return this.kdPreviewGamemode() === 'M'
            ? round.questions.multiplayer
            : (round.questions.singleplayer[this.kdPreviewPlayerIndex()] ?? []);
        }
        case 'vcnv':
          return this.vcnvRound()?.questions ?? [];
        case 'tt':
          return this.ttRound()?.questions ?? [];
        case 'vd': {
          const index = this.vdPreviewPlayerIndex();
          return index >= 0 ? (this.vdRound()?.questionPools[index] ?? []) : [];
        }
        case 'chp':
          return this.chpRound()?.questions ?? [];
      }
    })();
    return questions.map((question, index) => toQuestionPreview(kind, question, index));
  });

  protected readonly obstacleImage = computed(() => {
    const obstacle = this.vcnvRound()?.questions.find((q) => q.type === 'CNV');
    return obstacle?.imageFile ? this.media.resolve('vcnv', obstacle.imageFile) : null;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    for (const off of [
      this.network.on<[KdRound]>('update-kd-data-admin', (data) => this.kdRound.set(data)),
      this.network.on<[VcnvRound]>('update-vcnv-data', (data) => this.vcnvRound.set(data)),
      this.network.on<[TtRound]>('update-tangtoc-data', (data) => this.ttRound.set(data)),
      this.network.on<[VdRound]>('update-vedich-data', (data) => this.vdRound.set(data)),
      this.network.on<[ChpRound]>('update-chp-data', (data) => this.chpRound.set(data)),
    ]) {
      destroyRef.onDestroy(off);
    }
    void this.loadRounds();
  }

  private async loadRounds(): Promise<void> {
    const [kd, vcnv, tt, vd, chp] = await Promise.all([
      this.api.getRound('kd'),
      this.api.getRound('vcnv'),
      this.api.getRound('tt'),
      this.api.getRound('vd'),
      this.api.getRound('chp'),
    ]);
    this.kdRound.set(kd);
    this.vcnvRound.set(vcnv);
    this.ttRound.set(tt);
    this.vdRound.set(vd);
    this.chpRound.set(chp);
    this.kdPreviewGamemode.set(kd.gamemode);
    this.kdPreviewPlayerIndex.set(kd.activePlayerIndex);
  }

  onClickRow(row: QuestionPreview): void {
    this.chosenRow.set(row);
  }

  /** Open the matching Material editor for the selected canonical question. */
  editSelectedQuestion(): void {
    const selected = this.chosenRow();
    if (!selected) return;

    const data = structuredClone(selected.source);
    switch (this.selectedKind()) {
      case 'kd':
        this.dialog
          .open(FormQKdComponent, { data: data as KdQuestion })
          .afterClosed()
          .subscribe((result?: KdQuestion) => this.saveEditedQuestion(selected, result));
        break;
      case 'vcnv':
        this.dialog
          .open(FormQVcnvComponent, { data: data as VcnvQuestion })
          .afterClosed()
          .subscribe((result?: VcnvQuestion) => this.saveEditedQuestion(selected, result));
        break;
      case 'tt':
        this.dialog
          .open(FormQTtComponent, { data: data as TtQuestion })
          .afterClosed()
          .subscribe((result?: TtQuestion) => this.saveEditedQuestion(selected, result));
        break;
      case 'vd':
        this.dialog
          .open(FormQVdComponent, { data: data as VdQuestion })
          .afterClosed()
          .subscribe((result?: VdQuestion) => this.saveEditedQuestion(selected, result));
        break;
      case 'chp':
        this.dialog
          .open(FormQchpComponent, { data: data as ChpQuestion })
          .afterClosed()
          .subscribe((result?: ChpQuestion) => this.saveEditedQuestion(selected, result));
        break;
    }
  }

  private async saveEditedQuestion(selected: QuestionPreview, result?: QuestionPreview['source']): Promise<void> {
    if (!result) return;

    try {
      switch (this.selectedKind()) {
        case 'kd': {
          const round = structuredClone(this.kdRound());
          if (!round) return;
          if (this.kdPreviewGamemode() === 'M') {
            round.questions.multiplayer[selected.index] = result as KdQuestion;
          } else {
            round.questions.singleplayer[this.kdPreviewPlayerIndex()][selected.index] = result as KdQuestion;
          }
          this.kdRound.set(await this.api.putRound('kd', round));
          break;
        }
        case 'vcnv': {
          const round = structuredClone(this.vcnvRound());
          if (!round) return;
          round.questions[selected.index] = result as VcnvQuestion;
          this.vcnvRound.set(await this.api.putRound('vcnv', round));
          break;
        }
        case 'tt': {
          const round = structuredClone(this.ttRound());
          if (!round) return;
          round.questions[selected.index] = result as TtQuestion;
          this.ttRound.set(await this.api.putRound('tt', round));
          break;
        }
        case 'vd': {
          const playerIndex = this.vdPreviewPlayerIndex();
          const round = structuredClone(this.vdRound());
          if (!round || playerIndex < 0) return;
          round.questionPools[playerIndex][selected.index] = result as VdQuestion;
          this.vdRound.set(await this.api.putRound('vd', round));
          break;
        }
        case 'chp': {
          const round = structuredClone(this.chpRound());
          if (!round) return;
          round.questions[selected.index] = result as ChpQuestion;
          this.chpRound.set(await this.api.putRound('chp', round));
          break;
        }
      }
      this.chosenRow.set(null);
      this.snackBar.open('Đã lưu câu hỏi.', 'Đóng');
    } catch {
      this.snackBar.open('Không thể lưu câu hỏi.', 'Đóng');
    }
  }

  editPlayer(player: Player): void {
    const index = this.players().indexOf(player);
    if (index < 0) return;
    const dialogRef = this.dialog.open(FormPlayerComponent, { data: structuredClone(player) });
    dialogRef.afterClosed().subscribe(async (result?: Player) => {
      if (!result) return;
      result.score = Number(result.score) || 0;
      this.session.match.set(await this.api.updatePlayer(index, result));
    });
  }

  async onExcelSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.importedFileName.set(file.name);
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'buffer' });
    const sheet = (index: number) =>
      XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[index]]);
    const payload = { kd: sheet(0), vcnv: sheet(1), tt: sheet(2), vd: sheet(3) };
    try {
      await this.api.importExcel(payload);
      this.snackBar.open('Đã nhập đề từ file Excel.', undefined);
      await this.loadRounds();
    } catch {
      this.snackBar.open('Nhập file Excel thất bại.', undefined);
    }
  }

  async onLegionSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.importedFileName.set(file.name);
    try {
      const response = await this.api.importLegion(file);
      this.snackBar.open(`Đã nhập trận đấu: ${response.matchName}`, undefined);
      await this.loadRounds();
    } catch {
      this.snackBar.open('Nhập file .legion thất bại.', undefined);
    }
  }

  exportLegion(): void {
    window.open(this.api.exportLegionUrl());
  }
}
