import { EditorDataService } from './services/editor.data.service';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IEditorData } from '../services/interfaces/editor.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit {
  @Input() editorData?: IEditorData;
  constructor(
    public editorDataService: EditorDataService
  ){}
  readonly menus: Array<{name: string, icon: string}> = [
    {name: 'Cài đặt chung', icon: 'settings'},
    {name: 'Khởi động', icon: 'grass'},
    {name: 'Vượt chướng ngại vật', icon: 'landscape'},
    {name: 'Tăng tốc', icon: 'rocket_launch'},
    {name: 'Về đích', icon: 'military_tech'},
    {name: 'Câu hỏi phụ', icon: 'workspaces'}
  ]
  ngOnInit(): void {
    if (this.editorData){
      this.editorDataService.editorData = this.editorData;
    } else {

    }
  }
}
