import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-form-q-tt',
  templateUrl: './form-q-tt.component.html',
  styleUrls: ['./form-q-tt.component.scss']
})
export class FormQTtComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<FormQTtComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) { }

  ngOnInit(): void {
  }
  onNoClick() : void {
    this.dialogRef.close();
  }
}
