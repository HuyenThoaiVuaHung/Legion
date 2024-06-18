import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'cnv-viewer',
  standalone: true,
  imports: [],
  templateUrl: './cnv-viewer.component.html',
  styleUrl: './cnv-viewer.component.scss'
})
export class CnvViewerComponent implements OnChanges {
  @Input({required: true}) cnvMediaSrcs: string[] = [];
  public valid : boolean = true;
  constructor(){
  }
  ngOnChanges(){
    if (this.cnvMediaSrcs.length !== 5) this.valid = false;
    for (let src in this.cnvMediaSrcs){
      if (src === '') this.valid = false;
    }
  }
}
