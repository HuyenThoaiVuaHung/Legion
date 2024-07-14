import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterModule,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  constructor(
    public router : Router
  ){}

  public readonly routeNameMap: Map<string, string> = new Map<string, string>([
    ['dashboard', 'Tổng quan'],
    ['kd', 'Khởi động'],
    ['vcnv', 'Vượt chướng ngại vật'],
    ['tt', 'Tăng tốc'],
    ['vd', 'Về đích'],
    ['chp', 'Câu hỏi phụ']
  ]);
}
