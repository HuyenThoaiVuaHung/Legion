import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormPlayerComponent } from '../form-player/form-player.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApplicationConfig } from 'src/app/services/config.service';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-form-config',
  standalone: true,
  templateUrl: './form-config.component.html',
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatButtonModule
  ]
})
export class FormConfigComponent {
  constructor(
    public dialogRef: MatDialogRef<FormConfigComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApplicationConfig
  ) { }
  public config: ApplicationConfig = { ...this.data };
  ngOnInit(): void {
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
