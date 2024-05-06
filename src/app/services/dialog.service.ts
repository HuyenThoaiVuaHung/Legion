import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog.component';
import { lastValueFrom } from 'rxjs';
import { IQuestion } from '../interfaces/game.interface';
import { QuestionDialog } from '../../components/question-dialog/question-dialog.component';
import { ImageCropDialog } from '../../components/image-crop-dialog/image-crop-dialog.component';

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
  public async openQuestionDialog(question?: IQuestion): Promise<{question: IQuestion; media: File} | undefined> {
    const dialogRef = this.dialog.open(QuestionDialog, {
      data: question,
      maxWidth: 'max-content',
    });
    const result = await lastValueFrom<{question: IQuestion; media: File} | undefined>(dialogRef.afterClosed());
    console.log(result);
    return result;
  }
  public async openCropDialog(image: File, aspectRatioX: number = 16, aspectRatioY: number = 9): Promise<File | undefined> {
    const dialogRef = this.dialog.open(ImageCropDialog, {
      data: {
        image: image,
        aspectRatioX: aspectRatioX,
        aspectRatioY: aspectRatioY
      }
    });
    return lastValueFrom<File | undefined>(dialogRef.afterClosed());
  }
}
