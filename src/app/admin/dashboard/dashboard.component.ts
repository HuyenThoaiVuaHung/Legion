import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { PlayerTableComponent } from "../../../components/player-table/player-table.component";
import { IPlayer } from '../../interfaces/game.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditorItemComponent } from "../../../components/editor-item/editor-item.component";
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    PlayerTableComponent,
    MatIconModule,
    MatTooltipModule,
    EditorItemComponent,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class AdminDashboardComponent {
  public readonly players: Array<IPlayer> = [

  ]
}
