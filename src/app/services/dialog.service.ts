import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { lastValueFrom } from 'rxjs';
import { IQuestion } from '../interfaces/game.interface';
import { QuestionDialog } from '../../components/question-dialog/question-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    private dialog: MatDialog
  ) { }
  public async openConfirmationDialog(title?: string, description?: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: title,
        description: description
      }
    });
    return lastValueFrom<boolean>(dialogRef.afterClosed());
  }
  public async openQuestionDialog(): Promise<IQuestion | undefined> {
    const dialogRef = this.dialog.open(QuestionDialog);
    return lastValueFrom<IQuestion | undefined>(dialogRef.afterClosed());
  }
}
