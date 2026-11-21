import { Component, ChangeDetectionStrategy } from '@angular/core';
import { QuestionTableComponent } from '../components/question-table/question-table.component';
import { IQuestion, QuestionType } from '../editor.interfaces';

import { EditorDataService } from '../services/editor.data.service';

@Component({
  selector: 'app-chp',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    QuestionTableComponent
  ],
  templateUrl: './chp.component.html',
  styleUrl: './chp.component.scss'
})
export class EditorChpComponent {

  constructor(
    public editorDataService: EditorDataService
  ) {

  }
}