import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'image-input',
  standalone: true,
  imports: [MatRippleModule, MatIconModule, MatButtonModule, CommonModule],
  templateUrl: './image-input.component.html',
  styleUrls: ['./image-input.component.scss', './_image-input-theme.scss'],
})
export class ImageInputComponent {
  @Input() title: string | undefined;
  @Input() description: string | undefined;
  @Input() src: string = '../../assets/misc/logo.png';
  @Output() imageChangeEvent = new EventEmitter<File>();
  public handleImageInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        this.imageChangeEvent.emit(file);
      }
    };
    input.click();
  }
}
