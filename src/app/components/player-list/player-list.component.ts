import { Component, input, Input, OnInit, Signal } from "@angular/core";
import { Player } from "src/app/services/types/match.data";

@Component({
  selector: "player-list",
  templateUrl: "./player-list.component.html",
  styleUrls: ["./player-list.component.scss"],
})
export class PlayerListComponent {
  public turnIndex = input(-1);
  public highlightIndex = input(-1);
  public players: Signal<Player[]> = input([]);
  constructor() {}
}
