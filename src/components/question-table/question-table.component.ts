import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { IQuestion } from '../../app/interfaces/game.interface';
import { QuestionType } from '../../app/interfaces/game.interface';
import { IPlayer } from '../../app/interfaces/game.interface';
import { CdkDropList, CdkDrag, CdkDragHandle, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EditableComponent, EditModeDirective, ViewModeDirective } from '@ngneat/edit-in-place';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogService } from '../../app/services/dialog.service';


@Component({
  selector: 'question-table',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    EditableComponent,
    EditModeDirective,
    ViewModeDirective,
    MatIconModule,
    CommonModule,
    CdkDragHandle,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './question-table.component.html',
  styleUrl: './question-table.component.scss'
})
export class QuestionTableComponent {
  @Input({ required: true }) questions!: IQuestion[];
  @Input() allowDelete = true;
  @Input() mediaPlacement: 'inline' | 'under' = 'inline';
  @Input() allowCreate = true;
  @Input() context: "kd" | "vcnv" | "tt" | "vd" | "chp" | undefined;
  @Output() questionsChangeEvent = new EventEmitter<IQuestion[]>();
  @Output() onQuestionMediaChange = new EventEmitter<{
    questionIndex: number,
    media: File
  }>();
  public readonly questionType = QuestionType;
  save() {
    this.questionsChangeEvent.emit(this.questions);
  }
  cancel() {
    return;
  }
  constructor(
    private dialogService: DialogService,
  ) { }
  drop(event: CdkDragDrop<IPlayer[]>) {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    this.questionsChangeEvent.emit(this.questions);
  }
  async add() {
    const data = await this.dialogService.openQuestionDialog({
      question: '',
      answer: '',
      type: QuestionType.TEXT,
      value: 10
    },
      this.context === 'vd' ? [20, 30] : undefined);
    if (data) {
      let workingQuestion = data.question;
      this.questions.push(workingQuestion);
      this.questionsChangeEvent.emit();
      this.onQuestionMediaChange.emit(
        {
          questionIndex: this.questions.length - 1,
          media: data.media
        }
      );
    }
  }
}
