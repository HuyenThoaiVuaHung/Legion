import { Component, input, Signal } from '@angular/core';
import { Question } from 'src/app/services/types/game';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
  selector: 'app-media-preview',
  standalone: true,
  imports: [
    MenuItemComponent
  ],
  templateUrl: './media-preview.component.html',
  styleUrl: './media-preview.component.scss'
})
export class MediaPreviewComponent {
  public context: Signal<'kd' | 'tt' | 'vcnv' | 'vd' | 'chp'> = input('kd');
  public question: Signal<Question> = input.required();
}
