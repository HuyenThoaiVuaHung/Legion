import { Injectable } from '@angular/core';
import {
  argbFromHex,
  DynamicColor,
  hexFromArgb,
  Hct,
  MaterialDynamicColors,
  SchemeTonalSpot,
} from '@material/material-color-utilities';
import { STORAGE_KEYS } from '../constants';

/**
 * Generates a Material 3 scheme from a single seed color — the same engine
 * behind Material Theme Builder — and writes it onto the `--mat-sys-*` custom
 * properties the app themes against, so a new seed retints everything live.
 */
@Injectable({ providedIn: 'root' })
export class PaletteService {
  /** Default seed matches the violet primary in styles.scss. */
  static readonly DEFAULT_SEED = '#7C4DFF';

  /** The dynamic-color roles we publish as --mat-sys-* tokens. */
  private static readonly ROLES: ReadonlyArray<[string, keyof typeof MaterialDynamicColors]> = [
    ['primary', 'primary'],
    ['on-primary', 'onPrimary'],
    ['primary-container', 'primaryContainer'],
    ['on-primary-container', 'onPrimaryContainer'],
    ['secondary', 'secondary'],
    ['on-secondary', 'onSecondary'],
    ['secondary-container', 'secondaryContainer'],
    ['on-secondary-container', 'onSecondaryContainer'],
    ['tertiary', 'tertiary'],
    ['on-tertiary', 'onTertiary'],
    ['tertiary-container', 'tertiaryContainer'],
    ['on-tertiary-container', 'onTertiaryContainer'],
    ['error', 'error'],
    ['on-error', 'onError'],
    ['error-container', 'errorContainer'],
    ['on-error-container', 'onErrorContainer'],
    ['surface', 'surface'],
    ['on-surface', 'onSurface'],
    ['on-surface-variant', 'onSurfaceVariant'],
    ['surface-dim', 'surfaceDim'],
    ['surface-container-lowest', 'surfaceContainerLowest'],
    ['surface-container-low', 'surfaceContainerLow'],
    ['surface-container', 'surfaceContainer'],
    ['surface-container-high', 'surfaceContainerHigh'],
    ['surface-container-highest', 'surfaceContainerHighest'],
    ['outline', 'outline'],
    ['outline-variant', 'outlineVariant'],
    ['shadow', 'shadow'],
  ];

  /** Applies the saved seed (or the default) — call once at startup. */
  init(): void {
    this.apply(this.savedSeed(), this.prefersDark());
  }

  savedSeed(): string {
    return localStorage.getItem(STORAGE_KEYS.paletteSeed) ?? PaletteService.DEFAULT_SEED;
  }

  /** Generate the scheme from `seedHex`, apply it, and persist the seed. */
  apply(seedHex: string, dark = this.prefersDark()): void {
    const source = Hct.fromInt(argbFromHex(seedHex));
    const scheme = new SchemeTonalSpot(source, dark, 0);
    const root = document.documentElement;
    for (const [token, role] of PaletteService.ROLES) {
      const color = MaterialDynamicColors[role] as DynamicColor;
      root.style.setProperty(`--mat-sys-${token}`, hexFromArgb(color.getArgb(scheme)));
    }
    localStorage.setItem(STORAGE_KEYS.paletteSeed, seedHex);
  }

  /** Clear the custom seed, reverting to the stylesheet's base theme. */
  reset(): void {
    localStorage.removeItem(STORAGE_KEYS.paletteSeed);
    const root = document.documentElement;
    for (const [token] of PaletteService.ROLES) {
      root.style.removeProperty(`--mat-sys-${token}`);
    }
  }

  private prefersDark(): boolean {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
