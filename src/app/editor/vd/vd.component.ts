import { Component } from '@angular/core';
import { QuestionTableComponent } from '../../../components/question-table/question-table.component';
import { MatButtonModule } from '@angular/material/button';
import { EditorDataService } from '../services/editor.data.service';
import { IQuestion, QuestionType } from '../../interfaces/game.interface';

@Component({
  selector: 'app-vd',
  standalone: true,
  imports: [
    QuestionTableComponent,
    MatButtonModule
  ],
  templateUrl: './vd.component.html',
  styleUrl: './vd.component.scss'
})
export class EditorVdComponent {
  //View control
  public selectedPlayerIndex: number = 0;


  public placeholderQuestions: Array<IQuestion[]> = [
    [
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.IMAGE,
        mediaSrc: 'https://picsum.photos/1920/1080'
      }, {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.IMAGE,
        mediaSrc: 'https://picsum.photos/1920/1080'
      }, {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.IMAGE,
        mediaSrc: 'https://picsum.photos/1920/1080'
      },
      {
        question: 'What is the capital of Germany?',
        answer: 'Berlin',
        value: 10,
        type: QuestionType.VIDEO,
        mediaSrc: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
    ],
    [
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
    ],
    [
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
    ],
    [
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        value: 10,
        type: QuestionType.TEXT,
      },
    ]
  ]
  constructor(
    public editorDataService: EditorDataService
  ) { }
}
