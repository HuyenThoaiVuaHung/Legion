import { EditorDataService } from './services/editor.data.service';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { IEditorData } from "../interfaces/config.interface";
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditorStatus } from './services/enums/editor.enum';
import { FileHandlerService } from './services/file.handler.service';

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
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit {
  @Input() editorData?: IEditorData;
  constructor(
    public editorDataService: EditorDataService,
    public router: Router,
    public fileHandler: FileHandlerService,
    public route: ActivatedRoute
  ) { }
  readonly menus: Array<{ name: string, icon: string, nav: string }> = [
    { name: 'Cài đặt chung', icon: 'settings', nav: 'general' },
    { name: 'Khởi động', icon: 'grass', nav: 'kd' },
    { name: 'Vượt chướng ngại vật', icon: 'landscape', nav: 'vcnv' },
    { name: 'Tăng tốc', icon: 'rocket_launch', nav: 'tt' },
    { name: 'Về đích', icon: 'military_tech', nav: 'vd' },
    { name: 'Câu hỏi phụ', icon: 'workspaces', nav: 'chp' }
  ]
  async ngOnInit(): Promise<void> {
    const uid: string | null = this.route.snapshot.queryParamMap.get('uid');
    if (this.editorData) {
      this.editorDataService.editorData = this.editorData;
    } else if (uid) {
      if (this.editorDataService.availableEditorDataUids.includes(uid))
        this.editorDataService.editorData = await this.editorDataService.loadLocalEditorData(uid);
      else {
        this.router.navigate(['/editor']);
        return;
      }
    }
  }
  public readonly routeNameMap: { [key: string]: string } = {
    general: 'Cài đặt chung',
    kd: 'Khởi động',
    vcnv: 'Vượt chướng ngại vật',
    tt: 'Tăng tốc',
    vd: 'Về đích',
    chp: 'Câu hỏi phụ'
  }
  public readonly editorStatusEnum = EditorStatus;
  public readonly editorStatusNameMap: { [key: string]: string } = {
    [this.editorStatusEnum.UNLOADED]: 'Chưa tải dữ liệu',
    [this.editorStatusEnum.LOADED]: 'Đã tải dữ liệu',
    [this.editorStatusEnum.WORKING]: 'Đang lưu',
    [this.editorStatusEnum.SAVED]: 'Đã lưu',
    [this.editorStatusEnum.ERROR]: 'Lỗi',
    [this.editorStatusEnum.UNSAVED]: 'Chưa lưu'
  }
}
