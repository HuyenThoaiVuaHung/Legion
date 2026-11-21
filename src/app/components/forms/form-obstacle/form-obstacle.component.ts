import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VcnvObstacle } from '../../../core/contracts/game';
import { ApiService } from '../../../core/services/api.service';
import { uploadObstacleImage } from '../../../core/vcnv-image.util';

@Component({
  selector: 'app-form-obstacle',
  templateUrl: './form-obstacle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButton, MatDialogModule, MatFormField, MatInput, MatLabel, MatProgressSpinner],
})
export class FormObstacleComponent {
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  readonly dialogRef = inject<MatDialogRef<FormObstacleComponent, VcnvObstacle>>(MatDialogRef);
  private readonly initial = inject<VcnvObstacle>(MAT_DIALOG_DATA);

  readonly form: VcnvObstacle = {
    ...this.initial,
    imagePieceFiles: this.initial.imagePieceFiles ? [...this.initial.imagePieceFiles] : undefined,
  };
  readonly uploadingImage = signal(false);

  async onImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploadingImage.set(true);
    try {
      Object.assign(this.form, await uploadObstacleImage(this.api, file));
    } catch {
      this.snackBar.open('Không thể tải hoặc xử lý hình ảnh chướng ngại vật.', 'Đóng');
    } finally {
      this.uploadingImage.set(false);
    }
  }

  save(): void {
    if (!this.form.question.trim() || !this.form.answer.trim()) {
      this.snackBar.open('Nhập đầy đủ giải thích và đáp án trước khi lưu.', 'Đóng');
      return;
    }
    if (!this.form.imageFile || !this.form.imagePieceFiles?.length) {
      this.snackBar.open('Tải ảnh chướng ngại vật trước khi lưu.', 'Đóng');
      return;
    }
    this.dialogRef.close({
      ...this.form,
      imagePieceFiles: [...this.form.imagePieceFiles],
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
