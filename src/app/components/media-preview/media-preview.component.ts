import { Component, input, Signal, ChangeDetectionStrategy } from '@angular/core';
import { Question } from 'src/app/services/types/game';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
    selector: 'app-media-preview',
    imports: [
        MenuItemComponent
    ],
    templateUrl: './media-preview.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './media-preview.component.scss'
})
export class MediaPreviewComponent {
  public context: Signal<'kd' | 'tt' | 'vcnv' | 'vd' | 'chp'> = input('kd');
  public question: Signal<Question> = input.required();
}
