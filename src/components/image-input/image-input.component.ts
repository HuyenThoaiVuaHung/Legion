import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'image-input',
  standalone: true,
  imports: [MatRippleModule, MatIconModule, MatButtonModule, CommonModule, MatInputModule],
  templateUrl: './image-input.component.html',
  styleUrls: ['./image-input.component.scss', './_image-input-theme.scss'],
})
export class ImageInputComponent {
  @Input() title: string | undefined;
  @Input() description: string | undefined;
  @Input() src: string = '../../assets/misc/logo.png';
  @Output() imageChangeEvent = new EventEmitter<File>();
  public error : string | undefined;
  public handleImageInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg,image/webp';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        if(['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].indexOf(file.type) === -1){
          this.error = 'Invalid file type. Please upload a valid image file.';
          return;
        }
        this.error = undefined;
        this.imageChangeEvent.emit(file);
      }
    };
    input.click();
  }
}
