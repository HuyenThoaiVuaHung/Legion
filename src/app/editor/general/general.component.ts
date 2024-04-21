import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ImageInputComponent } from '../../../components/image-input/image-input.component';
import { MatTableModule } from '@angular/material/table';
import { EditorDataService } from '../services/editor.data.service';
import { PlayerTableComponent } from '../../../components/player-table/player-table.component';

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [
    MatCardModule,
    MatExpansionModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatSlideToggleModule,
    ImageInputComponent,
    PlayerTableComponent
  ],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss'
})
export class EditorGeneralComponent {
  displayedColumns: string[] = ['name', 'score', 'isReady'];
  constructor(
    public editorData: EditorDataService
  ) {

  }
}
