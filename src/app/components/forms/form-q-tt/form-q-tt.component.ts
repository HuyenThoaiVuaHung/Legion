import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TtQuestion } from '../../../core/contracts/game';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-form-q-tt',
  templateUrl: './form-q-tt.component.html',
  styleUrl: './form-q-tt.component.scss',
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
export class FormQTtComponent {
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  readonly dialogRef = inject<MatDialogRef<FormQTtComponent, TtQuestion>>(MatDialogRef);
  private readonly initial = inject<TtQuestion>(MAT_DIALOG_DATA);

  readonly form: TtQuestion = { ...this.initial, type: this.initial.type ?? 'image' };
  readonly uploadingQuestionImage = signal(false);
  readonly uploadingAnswerImage = signal(false);
  readonly uploadingVideo = signal(false);

  async onQuestionImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingQuestionImage.set(true);
    try {
      const { fileName } = await this.api.uploadMedia('tt', file);
      this.form.questionImage = fileName;
    } catch {
      this.snackBar.open('Không thể tải ảnh câu hỏi lên máy chủ.', 'Đóng');
    } finally {
      this.uploadingQuestionImage.set(false);
    }
  }

  async onAnswerImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingAnswerImage.set(true);
    try {
      const { fileName } = await this.api.uploadMedia('tt', file);
      this.form.answerImage = fileName;
    } catch {
      this.snackBar.open('Không thể tải ảnh đáp án lên máy chủ.', 'Đóng');
    } finally {
      this.uploadingAnswerImage.set(false);
    }
  }

  async onVideoSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingVideo.set(true);
    try {
      const { fileName } = await this.api.uploadMedia('tt', file);
      this.form.videoFile = fileName;
    } catch {
      this.snackBar.open('Không thể tải video lên máy chủ.', 'Đóng');
    } finally {
      this.uploadingVideo.set(false);
    }
  }

  save(): void {
    if (!this.form.question.trim() || !this.form.answer.trim()) {
      this.snackBar.open('Nhập đầy đủ câu hỏi và đáp án trước khi lưu.', 'Đóng');
      return;
    }
    if (this.form.type === 'image' && (!this.form.questionImage || !this.form.answerImage)) {
      this.snackBar.open('Tải đủ ảnh câu hỏi và đáp án trước khi lưu.', 'Đóng');
      return;
    }
    if (this.form.type === 'video' && !this.form.videoFile) {
      this.snackBar.open('Tải video câu hỏi trước khi lưu.', 'Đóng');
      return;
    }
    this.dialogRef.close({ ...this.form });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
