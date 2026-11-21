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
  readonly form: VcnvQuestion = { ...this.initial };
  readonly uploadingAudio = signal(false);

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
    if (this.form.type === 'HN_S' && !this.form.audioFile) {
      this.snackBar.open('Tải file âm thanh cho hàng ngang đặc biệt trước khi lưu.', 'Đóng');
      return;
    }
    this.dialogRef.close({ ...this.form });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
