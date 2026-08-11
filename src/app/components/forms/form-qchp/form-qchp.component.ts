import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-form-qchp',
    templateUrl: './form-qchp.component.html',
    styleUrls: ['./form-qchp.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        MatFormFieldModule,
        FormsModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule
    ]
})
export class FormQchpComponent implements OnInit {
  dialogRef = inject<MatDialogRef<FormQchpComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);


  ngOnInit(): void {}
  onNoClick() : void {
    this.dialogRef.close();
  }
}
