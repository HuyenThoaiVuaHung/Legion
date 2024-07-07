import { Component } from '@angular/core';
import { EditorDataService } from '../services/editor.data.service';
import { EditorCardComponent } from '../../../components/editor-card/editor-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { FsService } from '../services/fs.service';
import { FileHandlerService } from '../services/file.handler.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    EditorCardComponent,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class EditorDashboardComponent {
  constructor(
    public editorDataService: EditorDataService,
    private fileHandler: FileHandlerService
  ) {

  }
  public async createNewEditorData(): Promise<void> {
    await this.editorDataService.saveLocalEditorData(this.editorDataService.provideNewEditorData());
  }
  public async uploadEditorDataFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.lg';
    input.click();
    input.onchange = async () => {
      const file = (input).files?.[0];
      if (file && file.name.endsWith('.lg')) {
        await this.fileHandler.loadEditorData(file);
      }
    }
  }
}
