import { Component, NgZone } from '@angular/core';
import { EditorDataService } from '../services/editor.data.service';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QuestionTableComponent } from '../../../components/question-table/question-table.component';
import { IQuestion } from '../../interfaces/game.interface';
import { QuestionType } from '../../interfaces/game.interface';

@Component({
  selector: 'app-kd',
  standalone: true,
  imports: [
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    QuestionTableComponent,
    MatIconModule
  ],
  templateUrl: './kd.component.html',
  styleUrl: './kd.component.scss',
})
export class EditorKdComponent {
  // Data to bind the display of appropriate version and control for UI elements.

  // Selected control type for handling O24 question data.
  public selectedO24Control: O24ControlType = O24ControlType.SINGLEPLAYER;
  public selectedO24SingleplayerPlayerIndex = 0;

  // Selected question pack for O23 question data.
  public selectedO23QuestionPack = 0;
  // Enum for the control type of the O24 question data.
  // Possible values are SINGLEPLAYER and MULTIPLAYER.
  public readonly controlType = O24ControlType;

  constructor(public editorDataService: EditorDataService) {}
  public save(){
    this.editorDataService.saveCurrentEditorData();
  }
  public changeO23QuestionPackIndex(index: number){
    this.selectedO23QuestionPack = index;

  }
}
export enum O24ControlType {
  SINGLEPLAYER = 'SINGLEPLAYER',
  MULTIPLAYER = 'MULTIPLAYER',
}
