import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ImageInputComponent } from '../../../components/image-input/image-input.component';
import { EditorDataService } from '../services/editor.data.service';
import { PlayerTableComponent } from '../../../components/player-table/player-table.component';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { EditorItemComponent } from '../../../components/editor-item/editor-item.component';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IMiscMedia, Pallette } from '../../interfaces/config.interface';
import { EditorMediaService } from '../services/editor.media.service';

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [
    MatCardModule,
    MatExpansionModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatSlideToggleModule,
    ImageInputComponent,
    PlayerTableComponent,
    MatDividerModule,
    CommonModule,
    MatSelectModule,
    EditorItemComponent,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss'
})
export class EditorGeneralComponent {
  constructor(
    public editorDataService: EditorDataService,
    public mediaService: EditorMediaService
  ) {
  }
  public matchVersionSnapshot = this.editorDataService.editorData?.matchData.matchVersion!;
  public readonly palettes = Pallette;
  async save() {
    this.editorDataService.saveCurrentEditorData();
  }
  public async handleImageChange(file: File, type: keyof IMiscMedia, index?: number) {
    if (this.editorDataService.editorData) {
      if (type !== 'players') this.editorDataService.editorData.uiConfig.miscImageSrcNames[type] = await this.mediaService.setMiscMedia(this.editorDataService.editorData?.uid!, file);
      else {
        if (!this.editorDataService.editorData.uiConfig.miscImageSrcNames.players) this.editorDataService.editorData.uiConfig.miscImageSrcNames.players = new Array(this.editorDataService.editorData.matchData.players.length).fill('');

        const fn = await this.mediaService.setMiscMedia(this.editorDataService.editorData?.uid!, file);
        this.editorDataService.editorData.uiConfig.miscImageSrcNames.players[index!] = fn;
        console.log(fn, type, index, 'check')
        console.log(this.editorDataService.editorData.uiConfig.miscImageSrcNames, 'check');
      }
      this.editorDataService.editorData = await this.editorDataService.resolveMediaSrcs(this.editorDataService.editorData);
      this.editorDataService.saveCurrentEditorData();
    }
  }

}
