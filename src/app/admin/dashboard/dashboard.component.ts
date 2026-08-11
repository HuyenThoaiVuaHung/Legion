import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import * as XLSX from 'xlsx';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { NgClass } from '@angular/common';
import { FormPlayerComponent } from '../../components/forms/form-player/form-player.component';
import { MenuItemComponent } from '../../components/menu-item/menu-item.component';
import { SNACKBAR_DURATION_MS } from '../../core/constants';
import {
  ChpRound,
  KdGamemode,
  KdRound,
  Player,
  RoundKind,
  TtRound,
  VcnvRound,
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
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
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
    return questions.map((question) => toQuestionPreview(kind, question));
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
      this.snackBar.open('Đã nhập đề từ file Excel.', undefined, {
        duration: SNACKBAR_DURATION_MS,
      });
      await this.loadRounds();
    } catch {
      this.snackBar.open('Nhập file Excel thất bại.', undefined, {
        duration: SNACKBAR_DURATION_MS,
      });
    }
  }

  async onLegionSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.importedFileName.set(file.name);
    try {
      const response = await this.api.importLegion(file);
      this.snackBar.open(`Đã nhập trận đấu: ${response.matchName}`, undefined, {
        duration: SNACKBAR_DURATION_MS,
      });
      await this.loadRounds();
    } catch {
      this.snackBar.open('Nhập file .legion thất bại.', undefined, {
        duration: SNACKBAR_DURATION_MS,
      });
    }
  }

  exportLegion(): void {
    window.open(this.api.exportLegionUrl());
  }
}
