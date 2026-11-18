import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from './contracts/api';
import { SessionService } from './services/session.service';

export const adminGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  return session.role() === Role.Admin ? true : inject(Router).parseUrl('/');
};

export const mcGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const role = session.role();
  return role === Role.Mc || role === Role.Admin ? true : inject(Router).parseUrl('/');
};
