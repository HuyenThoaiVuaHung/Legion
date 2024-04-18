import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NetworkingService } from './services/networking.service';
import { NetworkStatus } from './services/networking.enum';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule,MatIconModule, MatMenuModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})


export class AppComponent {
  title = 'relegion';
  readonly NETWORK_STATUS = NetworkStatus;
  constructor(public network: NetworkingService){

  }
  disconnect() {
    this.network.disconnect();
  }
}
