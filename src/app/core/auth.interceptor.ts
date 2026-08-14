import { HttpInterceptorFn } from '@angular/common/http';
import { STORAGE_KEYS } from './constants';

/** Attaches the session token to every API request that needs one. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(STORAGE_KEYS.authToken);
  if (!token || !req.url.includes('/api/')) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
