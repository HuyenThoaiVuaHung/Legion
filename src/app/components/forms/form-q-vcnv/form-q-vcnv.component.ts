import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VcnvQuestion } from '../../../core/contracts/game';
import { ApiService } from '../../../core/services/api.service';
import { splitVcnvImage } from '../../../core/vcnv-image.util';

@Component({
  selector: 'app-form-q-vcnv',
  templateUrl: './form-q-vcnv.component.html',
  styleUrl: './form-q-vcnv.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButton,
    MatDialogModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatProgressSpinner,
    MatRadioButton,
    MatRadioGroup,
  ],
})
export class FormQVcnvComponent {
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  readonly dialogRef = inject<MatDialogRef<FormQVcnvComponent, VcnvQuestion>>(MatDialogRef);
  private readonly initial = inject<VcnvQuestion>(MAT_DIALOG_DATA);

  /** Keep edits local until the operator deliberately saves. */
  readonly form: VcnvQuestion = {
    ...this.initial,
    imagePieceFiles: this.initial.imagePieceFiles ? [...this.initial.imagePieceFiles] : undefined,
  };
  readonly uploadingImage = signal(false);
  readonly uploadingAudio = signal(false);

  get isObstacle(): boolean {
    return this.form.type === 'CNV';
  }

  async onImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadingImage.set(true);
    try {
      const { fileName } = await this.api.uploadMedia('vcnv', file);
      this.form.imageFile = fileName;
      if (this.isObstacle) {
        const pieces = await splitVcnvImage(file);
        const uploaded = await Promise.all(
          pieces.map((piece, index) => this.api.uploadObstaclePiece(piece, `piece-${index}.png`)),
        );
        this.form.imagePieceFiles = uploaded.map(({ fileName: pieceName }) => pieceName);
      }
    } catch {
      this.snackBar.open('Không thể tải hoặc xử lý hình ảnh chướng ngại vật.', 'Đóng');
    } finally {
      this.uploadingImage.set(false);
    }
  }

  async onAudioSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadingAudio.set(true);
    try {
      const { fileName } = await this.api.uploadMedia('vcnv', file);
      this.form.audioFile = fileName;
    } catch {
      this.snackBar.open('Không thể tải file âm thanh lên máy chủ.', 'Đóng');
    } finally {
      this.uploadingAudio.set(false);
    }
  }

  save(): void {
    if (!this.form.question.trim() || !this.form.answer.trim()) {
      this.snackBar.open('Nhập đầy đủ câu hỏi và đáp án trước khi lưu.', 'Đóng');
      return;
    }
    if (this.isObstacle && (!this.form.imageFile || !this.form.imagePieceFiles?.length)) {
      this.snackBar.open('Tải ảnh chướng ngại vật trước khi lưu.', 'Đóng');
      return;
    }
    if (this.form.type === 'HN_S' && !this.form.audioFile) {
      this.snackBar.open('Tải file âm thanh cho hàng ngang đặc biệt trước khi lưu.', 'Đóng');
      return;
    }
    this.dialogRef.close({
      ...this.form,
      imagePieceFiles: this.form.imagePieceFiles ? [...this.form.imagePieceFiles] : undefined,
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
