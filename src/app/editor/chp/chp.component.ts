import { Component } from '@angular/core';
import { QuestionTableComponent } from '../../../components/question-table/question-table.component';
import { IQuestion, QuestionType } from '../../interfaces/game.interface';
import { EditorDataService } from '../services/editor.data.service';

@Component({
  selector: 'app-chp',
  standalone: true,
  imports: [
    QuestionTableComponent
  ],
  templateUrl: './chp.component.html',
  styleUrl: './chp.component.scss'
})
export class EditorChpComponent {
  public readonly placeholderQuestionData: IQuestion[] = [
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
  ];
  constructor(
    public editorDataService: EditorDataService
  ) {

  }
}
