import { Component } from '@angular/core';
import { EditorDataService } from '../services/editor.data.service';
import { QuestionTableComponent } from '../../../components/question-table/question-table.component';
import { IQuestion, QuestionType } from '../../interfaces/game.interface';
import { ImageInputComponent } from '../../../components/image-input/image-input.component';

@Component({
  selector: 'app-vcnv',
  standalone: true,
  imports: [
    QuestionTableComponent,
    ImageInputComponent
  ],
  templateUrl: './vcnv.component.html',
  styleUrl: './vcnv.component.scss'
})
export class EditorVcnvComponent {
  public questionData : IQuestion[] = [
    {
      question: 'What is the capital of France?',
      answer: 'Paris',
      questionValue: 10,
      type: QuestionType.TEXT,
    },
    {
      question: 'What is the capital of France?',
      answer: 'Paris',
      questionValue: 10,
      type: QuestionType.TEXT,
    },
    {
      question: 'What is the capital of France?',
      answer: 'Paris',
      questionValue: 10,
      type: QuestionType.TEXT,
    },
    {
      question: 'What is the capital of France?',
      answer: 'Paris',
      questionValue: 10,
      type: QuestionType.TEXT,
    },
    {
      question: 'What is the capital of France?',
      answer: 'Paris',
      questionValue: 10,
      type: QuestionType.TEXT,
    },
  ]
  constructor(
    public editorDataService : EditorDataService
  ){

  }
}
