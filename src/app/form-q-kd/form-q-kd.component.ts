import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-form-q-kd',
  templateUrl: './form-q-kd.component.html',
  styleUrls: ['./form-q-kd.component.scss']
})
export class FormQKdComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<FormQKdComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) {
   }

  ngOnInit(): void {
    if(this.data.type == undefined){
      this.data.type = 'N';
    }
  }
  onNoClick() : void {
    this.dialogRef.close();
  }
}
