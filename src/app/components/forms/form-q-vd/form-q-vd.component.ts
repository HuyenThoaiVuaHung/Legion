import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';

@Component({
    selector: 'app-form-q-vd',
    templateUrl: './form-q-vd.component.html',
    styleUrls: ['./form-q-vd.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        MatFormFieldModule,
        FormsModule,
        MatDialogModule,
        MatRadioModule,
        MatInputModule,
        MatButtonModule
    ]
})
export class FormQVdComponent implements OnInit {
  dialogRef = inject<MatDialogRef<FormQVdComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);



  constructor() {
    const data = this.data;

    if (!data.type){
      data.type = 'N';
    }
   }

  ngOnInit(): void {
    
  }
  onNoClick() : void {
    this.dialogRef.close();
  }
}
