import { Routes } from '@angular/router';
import { HostBankComponent } from './host-bank.component';
import { HostRoomsComponent } from './host-rooms.component';

export const HOST_ROUTES: Routes = [
  { path: '', redirectTo: 'rooms', pathMatch: 'full' },
  { path: 'rooms', component: HostRoomsComponent },
  { path: 'bank', component: HostBankComponent },
];
