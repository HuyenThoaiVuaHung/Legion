import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Crumb, NavbarComponent } from '../components/navbar/navbar.component';
import { HostStore } from './host.store';

@Component({
  selector: 'app-host',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatButton, MatCardModule, MatIcon, MatProgressBar, NavbarComponent],
  templateUrl: './host.component.html',
})
export class HostComponent {
  protected readonly store = inject(HostStore);
  private readonly router = inject(Router);

  protected readonly menus = [
    { name: 'Phòng của bạn', icon: 'meeting_room', nav: 'rooms' },
    { name: 'Ngân hàng', icon: 'inventory_2', nav: 'bank' },
  ] as const;

  constructor() { void this.store.refresh(); }

  protected get trail(): Crumb[] {
    return this.section ? [{ label: 'Chủ phòng', link: '/host' }, { label: this.section }] : [{ label: 'Chủ phòng' }];
  }

  protected get section(): string | undefined {
    const last = this.router.url.split(/[?#]/)[0].split('/').filter(Boolean).pop();
    return this.menus.find((m) => m.nav === last)?.name;
  }
}
