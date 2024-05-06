import { Component } from '@angular/core';
import { EditorDataService } from '../services/editor.data.service';
import { QuestionTableComponent } from '../../../components/question-table/question-table.component';
import { IQuestion, QuestionType } from '../../interfaces/game.interface';
import { ImageInputComponent } from '../../../components/image-input/image-input.component';
import { EditorMediaService } from '../services/editor.media.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-vcnv',
  standalone: true,
  imports: [
    QuestionTableComponent,
    ImageInputComponent
  ],
  templateUrl: './vcnv.component.html',
  styleUrl: './vcnv.component.scss'
})
export class EditorVcnvComponent {
  constructor(
    public editorDataService: EditorDataService,
    public editorMediaService: EditorMediaService,
    private dialogService: DialogService
  ) {

  }
  save() {
    this.editorDataService.saveCurrentEditorData();
  }
  async handleImageChange(file: File) {
    if (this.editorDataService.editorData) {
      const cropped = await this.dialogService.openCropDialog(file, 16, 9);
      if (cropped) {
        this.editorDataService.editorData.questionBank.vcnv.cnvMediaSrcName = await this.editorMediaService.setMedia(this.editorDataService.editorData.uid, cropped, 'vcnv');
        this.save();
        this.editorDataService.editorData = await this.editorDataService.resolveMediaSrcs(this.editorDataService.editorData);
      }
    }
  }
}
