import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { KdQuestion } from '../../../core/contracts/game';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-form-q-kd',
  templateUrl: './form-q-kd.component.html',
  styleUrl: './form-q-kd.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatDialogModule,
    MatRadioModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
})
export class FormQKdComponent {
  private readonly api = inject(ApiService);
  readonly dialogRef = inject<MatDialogRef<FormQKdComponent, KdQuestion>>(MatDialogRef);
  readonly data = inject<KdQuestion>(MAT_DIALOG_DATA);

  readonly uploading = signal(false);

  constructor() {
    this.data.type ??= 'N';
  }

  async onMediaSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    try {
      const { fileName } = await this.api.uploadMedia('kd', file);
      this.data.mediaFile = fileName;
    } finally {
      this.uploading.set(false);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
