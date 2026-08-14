import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatSlideToggle } from '@angular/material/slide-toggle';

/**
 * Client-local UI preferences — not part of the server-synced game state, so
 * there is no core contract for it. Structurally compatible with whatever
 * config store the caller injects as MAT_DIALOG_DATA.
 */
export interface AppConfig {
  automaticallyShowTangTocAnswer: boolean;
}

@Component({
  selector: 'app-form-config',
  templateUrl: './form-config.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, MatDialogModule, MatSlideToggle, MatButton],
})
export class FormConfigComponent {
  readonly dialogRef = inject<MatDialogRef<FormConfigComponent, AppConfig>>(MatDialogRef);
  readonly data = inject<AppConfig>(MAT_DIALOG_DATA);

  config: AppConfig = { ...this.data };

  onNoClick(): void {
    this.dialogRef.close();
  }
}
