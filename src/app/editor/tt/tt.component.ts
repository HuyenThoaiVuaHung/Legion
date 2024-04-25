import { Component } from '@angular/core';
import { EditorDataService } from '../services/editor.data.service';
import { MatButtonModule } from '@angular/material/button';
import { IQuestion, QuestionType } from '../../interfaces/game.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-tt',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './tt.component.html',
  styleUrl: './tt.component.scss'
})
export class EditorTtComponent {
  // View controls
  public selectedQuestionIndex = 0;
  public questionData: IQuestion[] = [
    {
      question: 'What is the capital of France?',
      answer: 'Paris',
      questionValue: 10,
      type: QuestionType.IMAGE,
      mediaSrc: 'https://picsum.photos/1920/1080'
    }, {
      question: 'What is the capital of France?',
      answer: 'Paris',
      questionValue: 10,
      type: QuestionType.IMAGE,
      mediaSrc: 'https://picsum.photos/1920/1080'
    }, {
      question: 'What is the capital of France?',
      answer: 'Paris',
      questionValue: 10,
      type: QuestionType.IMAGE,
      mediaSrc: 'https://picsum.photos/1920/1080'
    },
    {
      question: 'What is the capital of Germany?',
      answer: 'Berlin',
      questionValue: 10,
      type: QuestionType.VIDEO,
      mediaSrc: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
  ]

  //Enum
  public readonly questionType = QuestionType;
  constructor(
    public editorDataService: EditorDataService
  ) {

  }
}
