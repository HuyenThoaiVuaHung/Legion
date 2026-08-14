import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TtQuestion } from '../../../core/contracts/game';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-form-q-tt',
  templateUrl: './form-q-tt.component.html',
  styleUrl: './form-q-tt.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatFormField,
    FormsModule,
    MatDialogModule,
    MatRadioGroup,
    MatRadioButton,
    MatInput,
    MatButton,
    MatProgressSpinner,
  ],
})
export class FormQTtComponent {
  private readonly api = inject(ApiService);
  readonly dialogRef = inject<MatDialogRef<FormQTtComponent, TtQuestion>>(MatDialogRef);
  readonly data = inject<TtQuestion>(MAT_DIALOG_DATA);

  readonly uploadingQuestionImage = signal(false);
  readonly uploadingAnswerImage = signal(false);
  readonly uploadingVideo = signal(false);

  constructor() {
    this.data.type ??= 'image';
  }

  async onQuestionImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingQuestionImage.set(true);
    try {
      const { fileName } = await this.api.uploadMedia('tt', file);
      this.data.questionImage = fileName;
    } finally {
      this.uploadingQuestionImage.set(false);
    }
  }

  async onAnswerImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingAnswerImage.set(true);
    try {
      const { fileName } = await this.api.uploadMedia('tt', file);
      this.data.answerImage = fileName;
    } finally {
      this.uploadingAnswerImage.set(false);
    }
  }

  async onVideoSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingVideo.set(true);
    try {
      const { fileName } = await this.api.uploadMedia('tt', file);
      this.data.videoFile = fileName;
    } finally {
      this.uploadingVideo.set(false);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
