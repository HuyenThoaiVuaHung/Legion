import { ChangeDetectorRef, Component, Input, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { EditorDataService } from '../../services/editor.data.service';
import { IMatchData, IEditorData } from '../../editor.interfaces';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PlayerTableComponent } from '../player-table/player-table.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

import { Router } from '@angular/router';
import { FileHandlerService } from '../../services/file.handler.service';

@Component({
  selector: 'editor-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
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
  @Input() editorData: IEditorData | undefined = undefined;
  constructor(
    private editorDataService: EditorDataService,
    private router: Router,
    private fileHandlerService: FileHandlerService
  ) {

  }
  private readonly cdr = inject(ChangeDetectorRef);
  async ngOnInit(): Promise<void> {
    try {
      this.editorData = await this.editorDataService.loadLocalEditorData(this.uid);
    } catch {
      // A uid listed in localStorage whose OPFS data is gone or unreadable.
      this.editorDataService.forgetEditorDataUid(this.uid);
    }
    this.cdr.markForCheck();
  }
  load() {
    if (this.editorData) this.editorDataService.setEditorData(this.editorData);
    if (this.editorDataService.editorData) this.router.navigate(['/editor/general']);
  }
  async delete() {
    await this.editorDataService.deleteLocalEditorData(this.uid);
    if (this.editorDataService.editorData?.uid === this.uid) {
      this.editorDataService.unloadEditorData();
    }
    this.editorDataService.loadAvailableEditorDataUids();
  }
  download() {
    this.fileHandlerService.downloadEditorData(this.uid);
  }
}