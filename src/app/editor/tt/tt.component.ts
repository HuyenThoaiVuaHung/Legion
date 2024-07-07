import { Component } from '@angular/core';
import { EditorDataService } from '../services/editor.data.service';
import { MatButtonModule } from '@angular/material/button';
import { IQuestion } from '../../interfaces/game.interface';
import { QuestionType } from '../../interfaces/game.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditableComponent, EditModeDirective, ViewModeDirective } from '@ngneat/edit-in-place';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EditorMediaService } from '../services/editor.media.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-tt',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    EditableComponent,
    EditModeDirective,
    ViewModeDirective,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './tt.component.html',
  styleUrl: './tt.component.scss'
})
export class EditorTtComponent {
  // View controls
  public selectedQuestionIndex = 0;
  public viewAnswer = false;

  //Enum
  public readonly questionType = QuestionType;
  constructor(
    public editorDataService: EditorDataService,
    public editorMediaService: EditorMediaService,
    private dialogService: DialogService
  ) {

  }
  public uploadNewMedia(isSecondary: boolean = false) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*, video/*';
    fileInput.onchange = async (e) => {
      let file = (e.target as HTMLInputElement).files?.item(0);
      if (file) {
        if (file.type.includes('image')) {
          file = await this.dialogService.openCropDialog(file, 16, 9);
          if (!file) return;
        }
        if (this.editorDataService.editorData)
          this.editorDataService
            .editorData.questionBank
            .tt.questions[this.selectedQuestionIndex]
            = await this.editorMediaService.handleQuestionMedia(
              this.editorDataService.editorData.questionBank.tt.questions[this.selectedQuestionIndex],
              file,
              'tt',
              this.editorDataService.editorData.uid,
              isSecondary
            );
        this.editorDataService.saveCurrentEditorData();
        this.editorDataService.editorData = await this.editorDataService.resolveMediaSrcs(this.editorDataService.editorData!);
      };
    }
    fileInput.click();
  }
}
