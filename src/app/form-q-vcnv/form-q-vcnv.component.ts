import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-form-q-vcnv',
  templateUrl: './form-q-vcnv.component.html',
  styleUrls: ['./form-q-vcnv.component.scss']
})
export class FormQVcnvComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<FormQVcnvComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) { }

  ngOnInit(): void {
  }
  onNoClick() : void {
    this.dialogRef.close();
  }
}
