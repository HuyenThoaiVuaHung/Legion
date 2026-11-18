import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { ConfirmationDialogComponent } from '../components/operator-dialog/confirmation-dialog.component';
import { BrowserEditorService } from './browser-editor.service';
import { EditorDocument, EditorQuestion, EditorQuestionType, EditorRoundKind } from './editor.models';

interface EditorSection {
  id: 'general' | 'kd' | 'vcnv' | 'tt' | 'vd' | 'chp';
  label: string;
  icon: string;
}

const SECTIONS: readonly EditorSection[] = [
  { id: 'general', label: 'Chung', icon: 'tune' },
  { id: 'kd', label: 'Khởi động', icon: 'grass' },
  { id: 'vcnv', label: 'VCNV', icon: 'landscape' },
  { id: 'tt', label: 'Tăng tốc', icon: 'rocket_launch' },
  { id: 'vd', label: 'Về đích', icon: 'military_tech' },
  { id: 'chp', label: 'Câu hỏi phụ', icon: 'workspaces' },
];

const EDITOR_BRAND_ASSETS = [
  { key: 'logo', label: 'Logo' },
  { key: 'logo-long', label: 'Logo dài' },
  { key: 'placeholder', label: 'Ảnh chờ' },
  { key: 'background', label: 'Hình nền' },
] as const;

/**
 * Browser-first question editor. It shares the operator's Material language but
 * stores drafts and media locally until the operator explicitly exports .legion.
 */
@Component({
  selector: 'app-browser-editor',
  templateUrl: './browser-editor.component.html',
  styleUrl: './browser-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatSlideToggle,
    MatTabsModule,
    MatTooltip,
  ],
})
export class BrowserEditorComponent {
  protected readonly editor = inject(BrowserEditorService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly sections = SECTIONS;
  protected readonly brandAssets = EDITOR_BRAND_ASSETS;
  protected readonly brandPreviews = signal<Record<string, string | null>>({});
  protected readonly selectedSection = signal<EditorSection['id']>('general');
  protected readonly kdMode = signal<'singleplayer' | 'multiplayer'>('singleplayer');
  protected readonly kdPlayerIndex = signal(0);
  protected readonly vdPlayerIndex = signal(0);
  protected readonly selectedQuestionIndex = signal<number | null>(null);
  protected readonly primaryPreview = signal<string | null>(null);
  protected readonly secondaryPreview = signal<string | null>(null);
  protected readonly obstaclePreview = signal<string | null>(null);

  async create(): Promise<void> {
    await this.editor.createDocument();
    this.brandPreviews.set({});
    this.obstaclePreview.set(null);
    this.selectedSection.set('general');
  }

  async open(uid: string): Promise<void> {
    await this.editor.openDocument(uid);
    await Promise.all([this.refreshObstaclePreview(), this.refreshBrandPreviews()]);
    this.selectedSection.set('general');
  }

  async importArchive(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    await this.editor.importDocument(file);
    await Promise.all([this.refreshObstaclePreview(), this.refreshBrandPreviews()]);
  }

  exportArchive(): void {
    void this.editor.exportDocument();
  }

  confirmDeleteDocument(uid: string, matchName: string): void {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Xoá trận đấu?',
          message: `Trận đấu “${matchName}” và các file cục bộ của nó sẽ bị xoá khỏi trình duyệt này.`,
          confirmLabel: 'Xoá',
        },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) void this.editor.deleteDocument(uid);
      });
  }

  selectSection(section: EditorSection['id']): void {
    this.selectedSection.set(section);
    this.clearQuestionSelection();
  }

  setKdMode(mode: 'singleplayer' | 'multiplayer'): void {
    this.kdMode.set(mode);
    this.clearQuestionSelection();
  }

  setKdPlayerIndex(index: number): void {
    this.kdPlayerIndex.set(index);
    this.clearQuestionSelection();
  }

  setVdPlayerIndex(index: number): void {
    this.vdPlayerIndex.set(index);
    this.clearQuestionSelection();
  }

  updateMatchName(value: string): void {
    this.editor.update((document) => {
      document.matchData.matchName = value;
    });
  }

  updateEditorDarkMode(enabled: boolean): void {
    this.editor.update((document) => {
      document.uiConfig.darkMode = enabled;
    });
  }

  updateEditorPalette(value: string | number): void {
    const palette = Number(value);
    if (!Number.isFinite(palette)) return;
    this.editor.update((document) => {
      document.uiConfig.pallette = palette;
    });
  }

  async uploadBrandAsset(key: (typeof EDITOR_BRAND_ASSETS)[number]['key'], event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const fileName = await this.editor.saveMedia('misc', file);
      this.editor.update((document) => {
        document.uiConfig.miscImageSrcNames[key] = fileName;
      });
      const preview = await this.editor.mediaUrl('misc', fileName);
      this.brandPreviews.update((previews) => ({ ...previews, [key]: preview }));
    } catch {
      this.snackBar.open('Không thể lưu ảnh.', 'Đóng');
    }
  }

  updatePlayerName(index: number, value: string): void {
    this.editor.update((document) => {
      document.matchData.players[index].name = value;
    });
  }

  updatePlayerScore(index: number, value: string | number): void {
    const score = Number(value);
    if (!Number.isFinite(score)) return;
    this.editor.update((document) => {
      document.matchData.players[index].score = score;
    });
  }

  questions(): EditorQuestion[] {
    const document = this.editor.activeDocument();
    if (!document) return [];
    switch (this.selectedSection()) {
      case 'kd':
        return this.kdMode() === 'multiplayer'
          ? document.questionBank.kd.o24Questions.multiplayer
          : (document.questionBank.kd.o24Questions.singleplayer[this.kdPlayerIndex()] ?? []);
      case 'vcnv':
        return document.questionBank.vcnv.questions;
      case 'tt':
        return document.questionBank.tt.questions;
      case 'vd':
        return document.questionBank.vd.questions[this.vdPlayerIndex()] ?? [];
      case 'chp':
        return document.questionBank.chp.questions;
      default:
        return [];
    }
  }

  selectQuestion(index: number): void {
    this.selectedQuestionIndex.set(index);
    void this.refreshQuestionPreviews(index);
  }

  addQuestion(): void {
    const section = this.selectedSection();
    if (section === 'general' || section === 'vcnv' || section === 'tt') return;
    const question = blankQuestion(section);
    this.editor.update((document) => {
      this.questionCollection(document, section).push(question);
    });
    this.selectedQuestionIndex.set(this.questions().length - 1);
  }

  removeQuestion(index: number): void {
    const section = this.selectedSection();
    if (section === 'general' || section === 'vcnv' || section === 'tt') return;
    this.editor.update((document) => {
      this.questionCollection(document, section).splice(index, 1);
    });
    this.selectedQuestionIndex.set(null);
  }

  updateQuestion(
    index: number,
    field: 'question' | 'answer' | 'type' | 'value',
    value: string | number,
  ): void {
    const section = this.selectedSection();
    if (section === 'general') return;
    this.editor.update((document) => {
      const question = this.questionCollection(document, section)[index];
      if (!question) return;
      switch (field) {
        case 'question':
          question.question = String(value);
          break;
        case 'answer':
          question.answer = String(value);
          break;
        case 'type':
          question.type = Number(value) as EditorQuestionType;
          break;
        case 'value':
          question.value = Number(value);
          break;
      }
    });
  }

  async uploadQuestionMedia(index: number, secondary: boolean, event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    const section = this.selectedSection();
    if (!file || section === 'general') return;
    const kind = section as EditorRoundKind;
    try {
      const fileName = await this.editor.saveMedia(kind, file);
      this.editor.update((document) => {
        const question = this.questionCollection(document, section)[index];
        if (!question) return;
        question.type = mediaType(file.type);
        if (secondary) question.secondaryMediaSrcName = fileName;
        else question.mediaSrcName = fileName;
      });
      await this.refreshQuestionPreviews(index);
    } catch {
      this.snackBar.open('Không thể lưu file.', 'Đóng');
    }
  }

  updateObstacleAnswer(value: string): void {
    this.editor.update((document) => {
      document.questionBank.vcnv.cnv = value;
    });
  }

  async uploadObstacle(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const name = await this.editor.saveMedia('vcnv', file);
      this.editor.update((document) => {
        document.questionBank.vcnv.cnvMediaSrcNames = [name];
      });
      this.obstaclePreview.set(await this.editor.mediaUrl('vcnv', name));
    } catch {
      this.snackBar.open('Không thể lưu ảnh.', 'Đóng');
    }
  }

  private async refreshBrandPreviews(): Promise<void> {
    const assets = this.editor.activeDocument()?.uiConfig.miscImageSrcNames ?? {};
    const previews = await Promise.all(
      EDITOR_BRAND_ASSETS.map(async ({ key }) => [
        key,
        await this.editor.mediaUrl('misc', typeof assets[key] === 'string' ? assets[key] : undefined),
      ] as const),
    );
    this.brandPreviews.set(Object.fromEntries(previews));
  }

  private clearQuestionSelection(): void {
    this.selectedQuestionIndex.set(null);
    this.primaryPreview.set(null);
    this.secondaryPreview.set(null);
  }

  private async refreshQuestionPreviews(index: number): Promise<void> {
    const question = this.questions()[index];
    const section = this.selectedSection();
    if (!question || section === 'general') {
      this.primaryPreview.set(null);
      this.secondaryPreview.set(null);
      return;
    }
    const kind = section as EditorRoundKind;
    const [primary, secondary] = await Promise.all([
      this.editor.mediaUrl(kind, question.mediaSrcName),
      this.editor.mediaUrl(kind, question.secondaryMediaSrcName),
    ]);
    this.primaryPreview.set(primary);
    this.secondaryPreview.set(secondary);
  }

  private async refreshObstaclePreview(): Promise<void> {
    const fileName = this.editor.activeDocument()?.questionBank.vcnv.cnvMediaSrcNames[0];
    this.obstaclePreview.set(await this.editor.mediaUrl('vcnv', fileName));
  }

  confirmDelete(index: number): void {
    const question = this.questions()[index];
    if (!question) return;
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Xoá câu hỏi?',
          message: `Câu hỏi “${question.question || 'chưa có nội dung'}” sẽ bị xoá khỏi bản nháp này.`,
          confirmLabel: 'Xoá',
        },
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) this.removeQuestion(index);
      });
  }

  private questionCollection(document: EditorDocument, section: Exclude<EditorSection['id'], 'general'>): EditorQuestion[] {
    switch (section) {
      case 'kd':
        return this.kdMode() === 'multiplayer'
          ? document.questionBank.kd.o24Questions.multiplayer
          : document.questionBank.kd.o24Questions.singleplayer[this.kdPlayerIndex()];
      case 'vcnv': return document.questionBank.vcnv.questions;
      case 'tt': return document.questionBank.tt.questions;
      case 'vd': return document.questionBank.vd.questions[this.vdPlayerIndex()];
      case 'chp': return document.questionBank.chp.questions;
    }
    throw new Error('Unknown editor section');
  }
}

function blankQuestion(section: Exclude<EditorSection['id'], 'general'>): EditorQuestion {
  return {
    question: '',
    answer: '',
    type: section === 'tt' ? EditorQuestionType.Image : EditorQuestionType.Text,
    value: section === 'vcnv' ? 10 : section === 'vd' ? 20 : 0,
  };
}

function mediaType(mimeType: string): EditorQuestionType {
  if (mimeType.startsWith('image/')) return EditorQuestionType.Image;
  if (mimeType.startsWith('audio/')) return EditorQuestionType.Audio;
  if (mimeType.startsWith('video/')) return EditorQuestionType.Video;
  return EditorQuestionType.Text;
}
