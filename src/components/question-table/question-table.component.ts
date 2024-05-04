import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { IPlayer, IQuestion, QuestionType } from '../../app/interfaces/game.interface';
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
import { EditorDataService } from '../../app/editor/services/editor.data.service';
import { EditorMediaService } from '../../app/editor/services/editor.media.service';
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
  public readonly questionType = QuestionType;
  save() {
    // TODO: Implement this method
  }
  cancel() {
    // TODO: Implement this method
  }
  constructor(
    private dialogService: DialogService,
    private editorDataService: EditorDataService,
    private editorMediaService: EditorMediaService
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
    });
    if (data) {
      let workingQuestion = data.question;
      if (data.media) {
        if (this.context && this.editorDataService.editorData)
          workingQuestion = await this.editorMediaService.handleQuestionMedia(workingQuestion, data.media, this.context, this.editorDataService.editorData.uid);
      }

      this.questions.push(workingQuestion);
      this.questionsChangeEvent.emit();
      if (workingQuestion.mediaSrcName) {
        this.editorDataService.editorData = await this.editorDataService.resolveMediaSrcs(this.editorDataService.editorData!)
      }
    }
  }
}
