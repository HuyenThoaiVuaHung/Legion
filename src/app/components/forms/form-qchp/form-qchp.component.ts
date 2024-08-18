import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-form-qchp',
  templateUrl: './form-qchp.component.html',
  styleUrls: ['./form-qchp.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule
  ]

})
export class FormQchpComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<FormQchpComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) {
   }

  ngOnInit(): void {}
  onNoClick() : void {
    this.dialogRef.close();
  }
}
