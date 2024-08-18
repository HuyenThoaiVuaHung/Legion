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
@Component({
  selector: "app-form-q-tt",
  templateUrl: "./form-q-tt.component.html",
  styleUrls: ["./form-q-tt.component.scss"],
  standalone: true,
  imports: [MatFormFieldModule, FormsModule, MatDialogModule, MatInputModule, MatButtonModule],
})
export class FormQTtComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<FormQTtComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}
  onNoClick(): void {
    this.dialogRef.close();
  }
}
