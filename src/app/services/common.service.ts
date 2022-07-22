import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private data = new BehaviorSubject(-1);
  data$ = this.data.asObservable();

  changeData(data: number) {
    this.data.next(data)
  }
}
