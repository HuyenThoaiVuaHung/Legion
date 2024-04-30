import { Component } from '@angular/core';
import { EditorDataService } from '../services/editor.data.service';
import { EditorCardComponent } from '../../../components/editor-card/editor-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { FsService } from '../services/fs.service';

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
    private router: Router,
    private fsService: FsService
  ){
    this.editorDataService.loadAvailableEditorDataUids();

  }
  public async createNewEditorData(): Promise<void> {
    await this.editorDataService.saveLocalEditorData(await this.editorDataService.createNewEditorDataInstance());
    this.editorDataService.loadAvailableEditorDataUids();
  }
  public async processEditorDataFile(){
    // const input = document.getElementById('editorFileInput');
    // if (input){
    //   const file = (input as HTMLInputElement).files?.[0];
    //   if (file){
    //     const reader = new FileReader();
    //     reader.onload = async (e) => {
    //       const result = e.target?.result as string;
    //       await
    //       this.editorDataService.loadAvailableEditorDataUids();
    //     };
    //     reader.readAsText(file);
    //   }
    // }
  }
}
