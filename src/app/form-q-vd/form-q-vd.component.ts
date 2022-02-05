import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-form-q-vd',
  templateUrl: './form-q-vd.component.html',
  styleUrls: ['./form-q-vd.component.scss']
})
export class FormQVdComponent implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<FormQVdComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) {
   }

  ngOnInit(): void {
    
  }
  onNoClick() : void {
    this.dialogRef.close();
  }
}
