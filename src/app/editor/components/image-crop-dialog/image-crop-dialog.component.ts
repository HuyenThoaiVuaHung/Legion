import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogTitle } from '@angular/material/dialog';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-crop-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogTitle,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatDialogContent,
    ImageCropperComponent
  ],
  templateUrl: './image-crop-dialog.component.html',
  styleUrl: './image-crop-dialog.component.scss'
})
export class ImageCropDialog {
  public resultImage: File | undefined = undefined;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data : {
      image: File,
      aspectRatioX: number,
      aspectRatioY: number,
    }
  ){
  }
  imageCropped(event: ImageCroppedEvent){
    this.resultImage = new File([event.blob!], this.data.image.name, { type: this.data.image.type });
  }
}