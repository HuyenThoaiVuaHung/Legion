import { Component } from '@angular/core';
import { EditorDataService } from '../services/editor.data.service';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QuestionTableComponent } from '../../../components/question-table/question-table.component';
import { IQuestion, QuestionType } from '../../interfaces/game.interface';

@Component({
  selector: 'app-kd',
  standalone: true,
  imports: [
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    QuestionTableComponent
  ],
  templateUrl: './kd.component.html',
  styleUrl: './kd.component.scss'
})
export class EditorKdComponent {

  // Data to bind the display of appropriate version and control for UI elements.

  // Selected control type for handling O24 question data.
  public selectedO24Control : O24ControlType = O24ControlType.SINGLEPLAYER;
  public selectedO24SingleplayerPlayerIndex = 0;

  // Selected question pack for O23 question data.
  public selectedO23QuestionPack = 0;
  // Enum for the control type of the O24 question data.
  // Possible values are SINGLEPLAYER and MULTIPLAYER.
  public readonly controlType = O24ControlType;
  // Universal question data.
  public questionData: IQuestion[] = placeholderQuestionData;
  constructor (
    public editorDataService: EditorDataService
  ) {

  }

}
export enum O24ControlType {
  SINGLEPLAYER = 'SINGLEPLAYER',
  MULTIPLAYER = 'MULTIPLAYER'
}
const placeholderQuestionData: IQuestion[] = [
  {
    question: 'What is the capital of France?',
    answer: 'Paris',
    questionValue: 10,
    type: QuestionType.IMAGE,
    mediaSrc: 'https://picsum.photos/300/200'
  },
  {
    question: 'What is the capital of Germany?',
    answer: 'Berlin',
    questionValue: 10,
    type: QuestionType.VIDEO,
    mediaSrc: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    question: 'What is the capital of Italy?',
    answer: 'Rome',
    questionValue: 10,
    type: QuestionType.AUDIO,
    mediaSrc: 'https://diviextended.com/wp-content/uploads/2021/10/sound-of-waves-marine-drive-mumbai.mp3'
  },
  {
    question: 'What is the capital of Spain?',
    answer: 'Madrid',
    questionValue: 10,
    type: QuestionType.TEXT
  },
  {
    question: 'What is the capital of Portugal?',
    answer: 'Lisbon',
    questionValue: 10,
    type: QuestionType.TEXT
  },
  {
    question: 'What is the capital of Greece?',
    answer: 'Athens',
    questionValue: 10,
    type: QuestionType.TEXT
  },
  {
    question: 'What is the capital of Turkey?',
    answer: 'Ankara',
    questionValue: 10,
    type: QuestionType.TEXT
  },
  {
    question: 'What is the capital of Egypt?',
    answer: 'Cairo',
    questionValue: 10,
    type: QuestionType.TEXT
  },
  {
    question: 'What is the capital of South Africa?',
    answer: 'Pretoria',
    questionValue: 10,
    type: QuestionType.TEXT
  },
];
