import { Component } from '@angular/core';
import { EditorDataService } from '../services/editor.data.service';
import { QuestionTableComponent } from '../../../components/question-table/question-table.component';
import { IQuestion } from '../../interfaces/game.interface';
import { QuestionType } from '../../interfaces/game.interface';
import { ImageInputComponent } from '../../../components/image-input/image-input.component';
import { EditorMediaService } from '../services/editor.media.service';
import { DialogService } from '../../services/dialog.service';
import { CnvViewerComponent } from '../../../components/cnv-viewer/cnv-viewer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EditableComponent, EditModeDirective, ViewModeDirective } from '@ngneat/edit-in-place';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-vcnv',
  standalone: true,
  imports: [
    QuestionTableComponent,
    ImageInputComponent,
    CnvViewerComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    EditableComponent,
    EditModeDirective,
    ViewModeDirective,
    MatFormFieldModule,
    FormsModule,
    MatInputModule
  ],
  templateUrl: './vcnv.component.html',
  styleUrl: './vcnv.component.scss',
})
export class EditorVcnvComponent {
  constructor(
    public editorDataService: EditorDataService,
    public editorMediaService: EditorMediaService,
    private dialogService: DialogService
  ) {}
  public cache: string = '';
  public imageProccessing: boolean = false;
  save() {
    this.editorDataService.saveCurrentEditorData();
  }
  async handleQuestionMediaChange(event: { questionIndex: number, media: File }) {
    if(this.editorDataService.editorData) this.editorDataService.editorData.questionBank.vcnv.questions[event.questionIndex] = await this.editorMediaService.handleQuestionMedia(
      this.editorDataService.editorData.questionBank.vcnv.questions[event.questionIndex],
      event.media,
      'vcnv',
      this.editorDataService.editorData.uid
    );
    this.save();
  }
  async handleCnvImage() {
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.click();
    file.onchange = async () => {
      if (this.editorDataService.editorData) {
        const cropped = await this.dialogService.openCropDialog(
          file.files![0],
          16,
          9
        );
        if (cropped) {
          this.imageProccessing = true;
          this.editorDataService.editorData.questionBank.vcnv.cnvMediaSrcNames =
            await this.editorMediaService.handleCnvMedia(
              cropped,
              this.editorDataService.editorData.uid
            );
          this.save();
          this.editorDataService.editorData =
            await this.editorDataService.resolveMediaSrcs(
              this.editorDataService.editorData
            );
          this.imageProccessing = false;
        }
      }
    };
  }
}
