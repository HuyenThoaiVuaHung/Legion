import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VdQuestion } from '../../../core/contracts/game';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-form-q-vd',
  templateUrl: './form-q-vd.component.html',
  styleUrl: './form-q-vd.component.scss',
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
export class FormQVdComponent {
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  readonly dialogRef = inject<MatDialogRef<FormQVdComponent, VdQuestion>>(MatDialogRef);
  private readonly initial = inject<VdQuestion>(MAT_DIALOG_DATA);

  readonly form: VdQuestion = { ...this.initial, type: this.initial.type ?? 'N' };
  readonly uploading = signal(false);

  async onMediaSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploading.set(true);
    try {
      const { fileName } = await this.api.uploadMedia('vd', file);
      this.form.mediaFile = fileName;
    } catch {
      this.snackBar.open('Không thể tải file câu hỏi lên máy chủ.', 'Đóng');
    } finally {
      this.uploading.set(false);
    }
  }

  save(): void {
    if (!this.form.question.trim() || !this.form.answer.trim()) {
      this.snackBar.open('Nhập đầy đủ câu hỏi và đáp án trước khi lưu.', 'Đóng');
      return;
    }
    if (this.form.type !== 'N' && !this.form.mediaFile) {
      this.snackBar.open('Chọn file minh hoạ cho loại câu hỏi đã chọn.', 'Đóng');
      return;
    }
    this.dialogRef.close({ ...this.form });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
