import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { STORAGE_KEYS } from './constants';
import { Role } from './contracts/api';
import { SessionService } from './services/session.service';

/** Room pages: the URL's room code must have a usable token; otherwise the landing page offers to join it. */
export const roomGuard: CanActivateFn = async (route) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const code = route.paramMap.get('code') ?? '';
  await session.ready;
  return (await session.enterRoomCode(code)) ? true : router.parseUrl('/?join=' + encodeURIComponent(code));
};

export const adminGuard: CanActivateFn = async () => {
  const session = inject(SessionService);
  const router = inject(Router);
  await session.ready;
  return session.role() === Role.Admin ? true : router.parseUrl('/');
};

export const mcGuard: CanActivateFn = async () => {
  const session = inject(SessionService);
  const router = inject(Router);
  await session.ready;
  const role = session.role();
  return role === Role.Mc || role === Role.Admin ? true : router.parseUrl('/');
};

export const hostGuard: CanActivateFn = () =>
  localStorage.getItem(STORAGE_KEYS.accountToken) ? true : inject(Router).parseUrl('/?signin=1');
