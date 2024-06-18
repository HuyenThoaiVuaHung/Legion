import { Component } from '@angular/core';
import { QuestionTableComponent } from '../../../components/question-table/question-table.component';
import { IQuestion } from '../../interfaces/game.interface';
import { QuestionType } from '../../interfaces/game.interface';
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

  constructor(
    public editorDataService: EditorDataService
  ) {

  }
}
