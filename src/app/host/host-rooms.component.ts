import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { HostStore } from './host.store';

@Component({
  selector: 'app-host-rooms',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatButton, MatCardModule, MatIcon],
  templateUrl: './host-rooms.component.html',
})
export class HostRoomsComponent {
  protected readonly store = inject(HostStore);
}
