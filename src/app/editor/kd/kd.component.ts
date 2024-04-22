import { Component } from '@angular/core';
import { EditorDataService } from '../services/editor.data.service';

@Component({
  selector: 'app-kd',
  standalone: true,
  imports: [],
  templateUrl: './kd.component.html',
  styleUrl: './kd.component.scss'
})
export class EditorKdComponent {
  constructor (
    public editorData: EditorDataService
  ) {

  }
}
