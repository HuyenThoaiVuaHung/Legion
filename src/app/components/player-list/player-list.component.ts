import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Player } from '../../core/contracts/game';

@Component({
  selector: 'player-list',
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [],
})
export class PlayerListComponent {
  /** 0-based index of the player currently taking their turn, -1 for none. */
  readonly turnIndex = input(-1);
  /** 0-based index of the player to visually highlight, -1 for none. */
  readonly highlightIndex = input(-1);
  readonly players = input<Player[]>([]);
}
