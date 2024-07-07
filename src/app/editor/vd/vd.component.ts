import { Component } from '@angular/core';
import { QuestionTableComponent } from '../../../components/question-table/question-table.component';
import { MatButtonModule } from '@angular/material/button';
import { EditorDataService } from '../services/editor.data.service';
import { IQuestion } from '../../interfaces/game.interface';
import { QuestionType } from '../../interfaces/game.interface';

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


  constructor(
    public editorDataService: EditorDataService
  ) { }
}
