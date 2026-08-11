import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-form-player',
    templateUrl: './form-player.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        MatFormFieldModule,
        FormsModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule
    ]
})
export class FormPlayerComponent implements OnInit {
  dialogRef = inject<MatDialogRef<FormPlayerComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);


  ngOnInit(): void {
  }
  onNoClick() : void {
    this.dialogRef.close();
  }

}
