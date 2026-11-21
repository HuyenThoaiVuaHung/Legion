import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { HostStore } from './host.store';

@Component({
  selector: 'app-host-bank',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatButton, MatIconButton, MatCardModule, MatIcon, MatTooltip],
  templateUrl: './host-bank.component.html',
})
export class HostBankComponent {
  protected readonly store = inject(HostStore);
}
