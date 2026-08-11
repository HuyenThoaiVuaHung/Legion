import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Player } from '../../../core/contracts/game';

@Component({
  selector: 'app-form-player',
  templateUrl: './form-player.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatFormFieldModule, FormsModule, MatDialogModule, MatInputModule, MatButtonModule],
})
export class FormPlayerComponent {
  readonly dialogRef = inject<MatDialogRef<FormPlayerComponent, Player>>(MatDialogRef);
  readonly data = inject<Player>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }
}
