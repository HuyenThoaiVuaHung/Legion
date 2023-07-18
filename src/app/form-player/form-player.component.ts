import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-form-player',
  templateUrl: './form-player.component.html',
  styleUrls: ['./form-player.component.scss']
})
export class FormPlayerComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<FormPlayerComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any
  ) { }

  ngOnInit(): void {
  }
  onNoClick() : void {
    this.dialogRef.close();
  }

}
