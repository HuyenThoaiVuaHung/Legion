import { Component } from '@angular/core';
import { EditorDataService } from '../services/editor.data.service';
import { QuestionTableComponent } from '../../../components/question-table/question-table.component';
import { IQuestion, QuestionType } from '../../interfaces/game.interface';
import { ImageInputComponent } from '../../../components/image-input/image-input.component';
import { EditorMediaService } from '../services/editor.media.service';
import { DialogService } from '../../services/dialog.service';
import { CnvViewerComponent } from '../../../components/cnv-viewer/cnv-viewer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-vcnv',
  standalone: true,
  imports: [
    QuestionTableComponent,
    ImageInputComponent,
    CnvViewerComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
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
  public imageProccessing: boolean = false;
  save() {
    this.editorDataService.saveCurrentEditorData();
  }
  async handleNewImage() {
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
