import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-form-q-chp',
  templateUrl: './form-q-chp.component.html',
  styleUrls: ['./form-q-chp.component.scss']
})
export class FormQChpComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<FormQChpComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) { }
  ngOnInit(): void {
  }
  onNoClick() : void {
    this.dialogRef.close();
  }

}
