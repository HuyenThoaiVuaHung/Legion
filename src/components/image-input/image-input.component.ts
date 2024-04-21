import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MatRippleModule} from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'image-input',
  standalone: true,
  imports: [
    MatRippleModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './image-input.component.html',
  styleUrls: ['./image-input.component.scss', './_image-input-theme.scss']
})
export class ImageInputComponent {

}