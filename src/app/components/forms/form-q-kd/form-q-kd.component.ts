import { Component, Inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";

@Component({
  selector: "app-form-q-kd",
  templateUrl: "./form-q-kd.component.html",
  styleUrls: ["./form-q-kd.component.scss"],
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatDialogModule,
    MatRadioModule,
    MatInputModule,
    MatButtonModule
  ],
})
export class FormQKdComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<FormQKdComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data.type == undefined) {
      this.data.type = "N";
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
