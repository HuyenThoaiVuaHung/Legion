import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { JoinRoomResponse, PublicRoom } from '../core/contracts/api';
import { ApiService } from '../core/services/api.service';
import { joinError } from '../host/join-error';

@Component({
  selector: 'app-room-join-dialog',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, MatButton, MatDialogTitle, MatDialogContent, MatDialogActions, MatFormField, MatLabel, MatIcon, MatInput, MatError],
  template: `
    <h2 mat-dialog-title>{{ room.name }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" (ngSubmit)="join()" class="pt-2">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Mật mã (không bắt buộc)</mat-label>
          <input matInput formControlName="secret" autocomplete="off" />
          @if (error()) { <mat-error>{{ error() }}</mat-error> }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [disabled]="busy()" (click)="join()"><mat-icon>login</mat-icon> Vào phòng</button>
    </mat-dialog-actions>
  `,
})
export class RoomJoinDialogComponent {
  protected readonly room = inject<PublicRoom>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<RoomJoinDialogComponent, JoinRoomResponse>>(MatDialogRef);
  private readonly api = inject(ApiService);
  protected readonly form = inject(FormBuilder).group({ secret: '' });
  protected readonly error = signal('');
  protected readonly busy = signal(false);

  async join(): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      const secret = this.form.getRawValue().secret?.trim();
      this.ref.close(await this.api.joinRoom({ code: this.room.code, secret: secret || undefined }));
    } catch (e) {
      this.error.set(joinError(e));
    } finally {
      this.busy.set(false);
    }
  }
}
