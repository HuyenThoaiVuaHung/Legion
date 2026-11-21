import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

export interface NameDialogData { title: string; label: string; value: string }

@Component({
  selector: 'app-name-dialog',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, MatButton, MatDialogModule, MatFormField, MatLabel, MatInput],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="w-full pt-2">
        <mat-label>{{ data.label }}</mat-label>
        <input matInput [(ngModel)]="value" (keydown.enter)="ok()" autocomplete="off" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Huỷ</button>
      <button mat-button [disabled]="!value.trim()" (click)="ok()">Lưu</button>
    </mat-dialog-actions>
  `,
})
export class NameDialogComponent {
  protected readonly data = inject<NameDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<NameDialogComponent, string>>(MatDialogRef);
  protected value = this.data.value;
  ok(): void { if (this.value.trim()) this.ref.close(this.value.trim()); }
}
