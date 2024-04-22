import { Component, Input } from '@angular/core';
import { IQuestion } from '../../app/services/interfaces/question.interface';

@Component({
  selector: 'app-question-table',
  standalone: true,
  imports: [],
  templateUrl: './question-table.component.html',
  styleUrl: './question-table.component.scss'
})
export class QuestionTableComponent {
  @Input({required: true}) questions!: IQuestion[];
}
