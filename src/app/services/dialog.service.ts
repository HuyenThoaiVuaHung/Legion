import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    private dialog: MatDialog
  ) { }
  public async confirmationDialog(title?: string, message?: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: title,
        message: message
      }
    });
    return firstValueFrom<boolean>(dialogRef.afterClosed());
  }
}
