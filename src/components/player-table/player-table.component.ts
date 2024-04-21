import { IPlayer } from './../../app/services/interfaces/game.interface';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'player-table',
  standalone: true,
  imports: [CdkDropList, CdkDrag],
  templateUrl: './player-table.component.html',
  styleUrl: './player-table.component.scss'
})
export class PlayerTableComponent {
  @Input({required: true}) players!: IPlayer[];
  @Output() playersChangeEvent = new EventEmitter<IPlayer[]>();

  constructor() {
  }
  drop(event: CdkDragDrop<IPlayer[]>){
    moveItemInArray(this.players, event.previousIndex, event.currentIndex);
  }
}
