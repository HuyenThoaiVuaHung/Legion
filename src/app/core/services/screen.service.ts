import { Injectable, signal } from '@angular/core';

/**
 * Minimal typings for the browser Window Management API (not yet in lib.dom),
 * used to place the display window on a secondary monitor.
 */
interface ScreenDetailed {
  availLeft: number;
  availTop: number;
  availWidth: number;
  availHeight: number;
  isPrimary: boolean;
  label: string;
}
interface ScreenDetails {
  screens: ScreenDetailed[];
  currentScreen: ScreenDetailed;
}
interface WindowManagement {
  getScreenDetails?: () => Promise<ScreenDetails>;
}

/**
 * Sets up the "back screen" — the audience/projector display — with one call:
 * keep the display awake (Wake Lock), go fullscreen, and, when a second
 * monitor is available, open the view on it (Window Management API). Each
 * capability is feature-detected and degrades quietly.
 */
@Injectable({ providedIn: 'root' })
export class ScreenService {
  private wakeLock: WakeLockSentinel | null = null;

  readonly awake = signal(false);
  readonly fullscreen = signal(false);

  constructor() {
    document.addEventListener('fullscreenchange', () =>
      this.fullscreen.set(document.fullscreenElement !== null),
    );
    // The lock is released when the tab is hidden; re-acquire on return.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.awake()) void this.keepAwake();
    });
  }

  /** Request a screen wake lock so the projector never sleeps mid-match. */
  async keepAwake(): Promise<void> {
    if (!('wakeLock' in navigator)) return;
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => this.awake.set(false));
      this.awake.set(true);
    } catch {
      this.awake.set(false);
    }
  }

  async releaseWake(): Promise<void> {
    await this.wakeLock?.release();
    this.wakeLock = null;
    this.awake.set(false);
  }

  async enterFullscreen(element: Element = document.documentElement): Promise<void> {
    if (document.fullscreenElement) return;
    try {
      await element.requestFullscreen();
    } catch {
      /* denied or unsupported — ignore */
    }
  }

  async exitFullscreen(): Promise<void> {
    if (document.fullscreenElement) await document.exitFullscreen();
  }

  /** True when the browser exposes multi-monitor placement. */
  get canPlaceOnExternalScreen(): boolean {
    return typeof (window as unknown as WindowManagement).getScreenDetails === 'function';
  }

  /**
   * Open `url` as a borderless window on the first non-primary monitor, or the
   * current one if there is only a single screen. Returns the opened window.
   */
  async openOnExternalScreen(url: string): Promise<Window | null> {
    const api = window as unknown as WindowManagement;
    if (!api.getScreenDetails) return window.open(url, '_blank', 'popup');
    try {
      const details = await api.getScreenDetails();
      const target = details.screens.find((s) => !s.isPrimary) ?? details.currentScreen;
      const features = [
        `left=${target.availLeft}`,
        `top=${target.availTop}`,
        `width=${target.availWidth}`,
        `height=${target.availHeight}`,
      ].join(',');
      return window.open(url, '_blank', features);
    } catch {
      return window.open(url, '_blank', 'popup');
    }
  }

  /** Set up the current tab as the back screen: awake + fullscreen. */
  async presentHere(): Promise<void> {
    await this.keepAwake();
    await this.enterFullscreen();
  }
}
