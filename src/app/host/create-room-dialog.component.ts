import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { BankItem } from '../core/contracts/api';

@Component({
  selector: 'app-create-room-dialog',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, MatButton, MatDialogModule, MatFormField, MatIcon, MatLabel, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Tạo phòng mới</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="w-full pt-2">
        <mat-label>Bắt đầu từ</mat-label>
        <mat-select [(ngModel)]="source">
          <mat-option value="">Phòng trống</mat-option>
          @for (item of items; track item.id) { <mat-option [value]="item.id">{{ item.name }}</mat-option> }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Huỷ</button>
      <button mat-button (click)="ref.close(source)"><mat-icon>add</mat-icon> Tạo phòng</button>
    </mat-dialog-actions>
  `,
})
export class CreateRoomDialogComponent {
  protected readonly items = inject<BankItem[]>(MAT_DIALOG_DATA);
  protected readonly ref = inject<MatDialogRef<CreateRoomDialogComponent, string>>(MatDialogRef);
  protected source = '';
}
