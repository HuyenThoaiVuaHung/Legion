import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-form-qchp',
  templateUrl: './form-qchp.component.html',
  styleUrls: ['./form-qchp.component.scss']
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
