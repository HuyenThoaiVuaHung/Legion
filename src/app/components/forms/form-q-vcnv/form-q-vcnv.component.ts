import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VcnvQuestion } from '../../../core/contracts/game';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-form-q-vcnv',
  templateUrl: './form-q-vcnv.component.html',
  styleUrl: './form-q-vcnv.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatFormFieldModule,
    MatRadioModule,
    MatDialogModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
})
export class FormQVcnvComponent {
  private readonly api = inject(ApiService);
  readonly dialogRef = inject<MatDialogRef<FormQVcnvComponent, VcnvQuestion>>(MatDialogRef);
  readonly data = inject<VcnvQuestion>(MAT_DIALOG_DATA);

  readonly uploadingImage = signal(false);
  readonly uploadingAudio = signal(false);

  async onImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingImage.set(true);
    try {
      const { fileName } = await this.api.uploadMedia('vcnv', file);
      this.data.imageFile = fileName;
    } finally {
      this.uploadingImage.set(false);
    }
  }

  async onAudioSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingAudio.set(true);
    try {
      const { fileName } = await this.api.uploadMedia('vcnv', file);
      this.data.audioFile = fileName;
    } finally {
      this.uploadingAudio.set(false);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
