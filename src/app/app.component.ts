import { Component, HostListener } from '@angular/core';
import * as io from 'socket.io-client';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Legion';
  isBlocked: boolean = true;
  closeBlockFrame() {
    this.isBlocked = false;
  }
}
