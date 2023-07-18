import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

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
