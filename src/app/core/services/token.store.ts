import { Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '../constants';

const LEGACY_KEY = 'legion.authToken';

/** The room code in the URL, if any: refreshing a room page must select that room's token before anything loads. */
function codeFromUrl(): string | null {
  const match = /^\/room\/([^/]+)/.exec(window.location.pathname);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Room tokens, one per room code, so several rooms can stay signed in side by side. */
@Injectable({ providedIn: 'root' })
export class TokenStore {
  /** Code used for the single-room server and for pages that belong to no room. */
  static readonly DEFAULT = '_';

  readonly code = signal(codeFromUrl() ?? TokenStore.DEFAULT);

  constructor() {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy === null) return;
    if (this.get() === null) this.set(legacy);
    localStorage.removeItem(LEGACY_KEY);
  }

  get(code = this.code()): string | null {
    return localStorage.getItem(STORAGE_KEYS.roomTokenPrefix + code);
  }
  set(token: string, code = this.code()): void {
    localStorage.setItem(STORAGE_KEYS.roomTokenPrefix + code, token);
  }
  clear(code = this.code()): void {
    localStorage.removeItem(STORAGE_KEYS.roomTokenPrefix + code);
  }
  use(code: string): void {
    this.code.set(code);
  }
}
