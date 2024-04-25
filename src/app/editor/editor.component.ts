import { EditorDataService } from './services/editor.data.service';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { IEditorData } from '../interfaces/editor.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';

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
    MatDividerModule,
    MatMenuModule
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit {
  @Input() editorData?: IEditorData;
  constructor(
    public editorDataService: EditorDataService,
  ){}
  readonly menus: Array<{name: string, icon: string, nav: string}> = [
    {name: 'Cài đặt chung', icon: 'settings', nav: 'general'},
    {name: 'Khởi động', icon: 'grass', nav: 'kd'},
    {name: 'Vượt chướng ngại vật', icon: 'landscape', nav: 'vcnv'},
    {name: 'Tăng tốc', icon: 'rocket_launch', nav: 'tt'},
    {name: 'Về đích', icon: 'military_tech', nav: 'vd'},
    {name: 'Câu hỏi phụ', icon: 'workspaces', nav: 'chp'}
  ]
  ngOnInit(): void {
    if (this.editorData){
      this.editorDataService.editorData = this.editorData;
    } else {

    }
  }
}
