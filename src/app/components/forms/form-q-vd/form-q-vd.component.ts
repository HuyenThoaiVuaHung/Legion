import { Component, Inject, OnInit } from '@angular/core';
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
  standalone: true,
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


  constructor(
    public dialogRef: MatDialogRef<FormQVdComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) {
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
