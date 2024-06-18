import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { IQuestion } from '../../app/interfaces/game.interface';
import { QuestionType } from '../../app/interfaces/game.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-question-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './question-dialog.component.html',
  styleUrl: './question-dialog.component.scss'
})
export class QuestionDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    question: IQuestion,
    valueList?: number[]
  }, private fb: FormBuilder) {
    if (data.valueList) {
      this.questionForm.controls.value.setValue(data.valueList[0])
    }
   }
  public media: File | undefined = undefined;
  public mediaBlobUrl: string | undefined = undefined;
  public error: string | undefined;
  public questionForm = this.fb.group({
    question: [this.data.question.question, Validators.required],
    answer: [this.data.question.answer, Validators.required],
    type: [this.data.question.type, Validators.required],
    value: [this.data.question.value]
  });
  public readonly questionType = QuestionType;
  public submit() {
  }
  public uploadMedia() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*, video/*, audio/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        this.error = undefined;
        this.media = file;
        this.mediaBlobUrl = URL.createObjectURL(file);
      }
      else {
        this.error = 'No file selected.';
      }
    }
    input.click();
  }

}
