import { Component, Input, OnInit } from '@angular/core';
import { EditorDataService } from '../../app/editor/services/editor.data.service';
import { IMatchData } from '../../app/interfaces/game.interface';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PlayerTableComponent } from '../player-table/player-table.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { IEditorData } from '../../app/interfaces/editor.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'editor-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    PlayerTableComponent,
    MatIconModule,
    MatRippleModule
  ],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ],
  templateUrl: './editor-card.component.html',
  styleUrl: './editor-card.component.scss'
})
export class EditorCardComponent implements OnInit {
  @Input({ required: true }) uid = '';
  public editorData: IEditorData | undefined = undefined;
  constructor(
    private editorDataService: EditorDataService,
    private router: Router
  ) {
  }
  async ngOnInit(): Promise<void> {
    this.editorData = (await this.editorDataService.loadLocalEditorData(this.uid));
  }
  load() {
    if (this.editorData) this.editorDataService.setEditorData(this.editorData);
    if (this.editorDataService.editorData) this.router.navigate(['/editor/general']);
  }
  async delete(){
    await this.editorDataService.deleteLocalEditorData(this.uid);
    this.editorDataService.loadAvailableEditorDataUids();
  }
  download(){
    //TODO: Implement this method
    //this.editorDataService.downloadLocalEditorData(this.uid);
  }
}
