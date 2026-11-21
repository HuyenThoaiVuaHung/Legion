import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStore } from './services/token.store';

/** Attaches the active room's token to every API request that needs one. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStore).get();
  if (req.headers.has('Authorization') || !token || !req.url.includes('/api/')) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
