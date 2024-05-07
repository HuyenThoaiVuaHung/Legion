import { Component, Input } from '@angular/core';

@Component({
  selector: 'cnv-viewer',
  standalone: true,
  imports: [],
  templateUrl: './cnv-viewer.component.html',
  styleUrl: './cnv-viewer.component.scss'
})
export class CnvViewerComponent {
  @Input({required: true}) cnvMediaSrcs: string[] = [];
  public valid : boolean = true;
  constructor(){
  }
}
