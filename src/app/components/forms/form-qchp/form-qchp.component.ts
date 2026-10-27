import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChpQuestion } from '../../../core/contracts/game';

@Component({
  selector: 'app-form-qchp',
  templateUrl: './form-qchp.component.html',
  styleUrl: './form-qchp.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButton, MatDialogModule, MatFormField, MatInput, MatLabel],
})
export class FormQchpComponent {
  private readonly snackBar = inject(MatSnackBar);
  readonly dialogRef = inject<MatDialogRef<FormQchpComponent, ChpQuestion>>(MatDialogRef);
  private readonly initial = inject<ChpQuestion>(MAT_DIALOG_DATA);

  readonly form: ChpQuestion = { ...this.initial };

  save(): void {
    if (!this.form.question.trim() || !this.form.answer.trim()) {
      this.snackBar.open('Nhập đầy đủ câu hỏi và đáp án trước khi lưu.', 'Đóng');
      return;
    }
    this.dialogRef.close({ ...this.form });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
