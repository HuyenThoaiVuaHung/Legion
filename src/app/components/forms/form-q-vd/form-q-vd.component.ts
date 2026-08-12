import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { VdQuestion } from '../../../core/contracts/game';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-form-q-vd',
  templateUrl: './form-q-vd.component.html',
  styleUrl: './form-q-vd.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatFormField,
    MatLabel,
    FormsModule,
    MatDialogModule,
    MatRadioGroup,
    MatRadioButton,
    MatInput,
    MatButton,
    MatProgressSpinner,
  ],
})
export class FormQVdComponent {
  private readonly api = inject(ApiService);
  readonly dialogRef = inject<MatDialogRef<FormQVdComponent, VdQuestion>>(MatDialogRef);
  readonly data = inject<VdQuestion>(MAT_DIALOG_DATA);

  readonly uploading = signal(false);

  constructor() {
    this.data.type ??= 'N';
  }

  async onMediaSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    try {
      const { fileName } = await this.api.uploadMedia('vd', file);
      this.data.mediaFile = fileName;
    } finally {
      this.uploading.set(false);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
