import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ChpQuestion } from '../../../core/contracts/game';

@Component({
  selector: 'app-form-qchp',
  templateUrl: './form-qchp.component.html',
  styleUrl: './form-qchp.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatFormField, FormsModule, MatDialogModule, MatInput, MatButton],
})
export class FormQchpComponent {
  readonly dialogRef = inject<MatDialogRef<FormQchpComponent, ChpQuestion>>(MatDialogRef);
  readonly data = inject<ChpQuestion>(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close();
  }
}
