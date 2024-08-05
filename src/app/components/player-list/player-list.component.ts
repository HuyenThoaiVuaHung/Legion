import { Component, Input, OnInit } from "@angular/core";
import { Player } from "src/app/services/types/match.data";

@Component({
  selector: "player-list",
  templateUrl: "./player-list.component.html",
  styleUrls: ["./player-list.component.scss"],
})
export class PlayerListComponent {
  @Input() currentTurn = -1;
  @Input() players: Player[] = [];
  constructor() {}
}
