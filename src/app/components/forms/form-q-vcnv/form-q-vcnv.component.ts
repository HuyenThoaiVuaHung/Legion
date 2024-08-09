import { Component, Inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatRadioModule } from "@angular/material/radio";

@Component({
  selector: "app-form-q-vcnv",
  templateUrl: "./form-q-vcnv.component.html",
  styleUrls: ["./form-q-vcnv.component.scss"],
  standalone: true,
  imports: [MatFormFieldModule, MatRadioModule, MatDialogModule, FormsModule],
})
export class FormQVcnvComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<FormQVcnvComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}
  onNoClick(): void {
    this.dialogRef.close();
  }
}
