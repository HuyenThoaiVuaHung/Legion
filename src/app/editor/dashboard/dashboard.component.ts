import { Component } from '@angular/core';
import { EditorDataService } from '../services/editor.data.service';
import { EditorCardComponent } from '../../../components/editor-card/editor-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

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
    private router: Router
  ){
    this.editorDataService.loadAvailableEditorDataUids();

  }
  public async createNewEditorData(): Promise<void> {
    await this.editorDataService.createNewEditorDataInstance();
    this.editorDataService.loadAvailableEditorDataUids();
  }
}
