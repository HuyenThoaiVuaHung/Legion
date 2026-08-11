import { Component, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
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
    selector: "app-form-q-vcnv",
    templateUrl: "./form-q-vcnv.component.html",
    styleUrls: ["./form-q-vcnv.component.scss"],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatFormFieldModule, MatRadioModule, MatDialogModule, FormsModule, MatButtonModule, MatInputModule]
})
export class FormQVcnvComponent implements OnInit {
  dialogRef = inject<MatDialogRef<FormQVcnvComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);


  ngOnInit(): void {}
  onNoClick(): void {
    this.dialogRef.close();
  }
}
