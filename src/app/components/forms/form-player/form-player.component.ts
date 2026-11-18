import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Player } from '../../../core/contracts/game';

@Component({
  selector: 'app-form-player',
  templateUrl: './form-player.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButton, MatDialogModule, MatFormField, MatInput, MatLabel],
})
export class FormPlayerComponent {
  private readonly snackBar = inject(MatSnackBar);
  readonly dialogRef = inject<MatDialogRef<FormPlayerComponent, Player>>(MatDialogRef);
  private readonly initial = inject<Player>(MAT_DIALOG_DATA);

  /** Keep row state intact until Save; Cancel is reliably non-destructive. */
  readonly form: Player = { ...this.initial };

  save(): void {
    const name = this.form.name.trim();
    if (!name) {
      this.snackBar.open('Tên thí sinh không được để trống.', 'Đóng');
      return;
    }
    if (!Number.isFinite(this.form.score)) {
      this.snackBar.open('Điểm của thí sinh phải là một số hợp lệ.', 'Đóng');
      return;
    }
    this.dialogRef.close({ ...this.form, name });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
