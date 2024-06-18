import { IPlayer } from '../../app/interfaces/game.interface';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import {
  EditableComponent,
  EditModeDirective,
  ViewModeDirective,
} from '@ngneat/edit-in-place';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { EditorDataService } from '../../app/editor/services/editor.data.service';
@Component({
  selector: 'player-table',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    EditableComponent,
    EditModeDirective,
    ViewModeDirective,
    MatIconModule,
    CommonModule,
    CdkDragHandle,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './player-table.component.html',
  styleUrls: ['./player-table.component.scss', '../themes/_table-theme.scss'],
})
export class PlayerTableComponent {
  @Input({ required: true }) players!: IPlayer[];
  @Input() editable = true;
  @Output() playersChangeEvent = new EventEmitter<IPlayer[]>();
  save(){
    this.editorDataService.saveCurrentEditorData();
  }

  constructor(
    private editorDataService: EditorDataService,
  ) { }
  drop(event: CdkDragDrop<IPlayer[]>) {
    moveItemInArray(this.players, event.previousIndex, event.currentIndex);
    this.playersChangeEvent.emit(this.players);
  }
}
