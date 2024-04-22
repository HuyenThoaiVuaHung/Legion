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
import { EditorDataService } from '../services/editor.data.service';
import { PlayerTableComponent } from '../../../components/player-table/player-table.component';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { EditorItemComponent } from '../../../components/editor-item/editor-item.component';
import { MatIconModule } from '@angular/material/icon';

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
    PlayerTableComponent,
    MatDividerModule,
    CommonModule,
    MatSelectModule,
    EditorItemComponent,
    MatIconModule
  ],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss'
})
export class EditorGeneralComponent {
  displayedColumns: string[] = ['name', 'score', 'isReady'];


  constructor(
    public editorData: EditorDataService,
  ) {
  }
}
