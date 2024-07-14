import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'editor-item',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './editor-item.component.html',
  styleUrl: './editor-item.component.scss'
})
export class EditorItemComponent {
  @Input() title: string = 'Placeholder';
  @Input() description: string = 'Lorem ipsum dolor si amet';
  @Input() align: 'horizontal' | 'vertical' = 'horizontal';
  @Input() reversed: boolean = false;
}
