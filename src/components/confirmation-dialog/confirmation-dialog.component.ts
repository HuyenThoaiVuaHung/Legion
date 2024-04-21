import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public message: string = "Bạn có chắc không?") { }

}
