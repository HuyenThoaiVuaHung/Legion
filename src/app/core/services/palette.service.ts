import { Injectable, signal } from '@angular/core';
import {
  argbFromHex,
  DynamicColor,
  hexFromArgb,
  Hct,
  MaterialDynamicColors,
  SchemeTonalSpot,
} from '@material/material-color-utilities';
import { STORAGE_KEYS } from '../constants';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Generates a Material 3 scheme from a single seed color — the same engine
 * behind Material Theme Builder — and writes it onto the `--mat-sys-*` custom
 * properties the app themes against, so a new seed retints everything live.
 *
 * Supports three modes: a fixed light or dark scheme, or "system", which emits
 * both and lets `prefers-color-scheme` pick, matching the app's default.
 */
@Injectable({ providedIn: 'root' })
export class PaletteService {
  /** Default seed matches the orange primary in styles.scss (the v2 theme). */
  static readonly DEFAULT_SEED = '#FF8C00';
  /** Seed the rewrite used to persist on every startup; treated as "no choice made". */
  private static readonly LEGACY_DEFAULT_SEED = '#7C4DFF';
  /** Seeds written without a user choice (old default, old per-match palettes); cleared on startup. */
  private static readonly NON_USER_SEEDS = [PaletteService.LEGACY_DEFAULT_SEED, '#d32f2f', '#388e3c', '#1976d2', '#f9a825'];
  private static readonly STYLE_ID = 'legion-palette';

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

  readonly mode = signal<ThemeMode>(this.savedMode());

  /**
   * Applies the saved seed and mode — call once at startup. With no saved
   * choice the stylesheet's base theme stands, so nothing is generated or persisted.
   */
  init(): void {
    if (PaletteService.NON_USER_SEEDS.includes(localStorage.getItem(STORAGE_KEYS.paletteSeed) ?? '')) {
      localStorage.removeItem(STORAGE_KEYS.paletteSeed);
      localStorage.removeItem(STORAGE_KEYS.paletteMode);
    }
    if (localStorage.getItem(STORAGE_KEYS.paletteSeed) === null && localStorage.getItem(STORAGE_KEYS.paletteMode) === null) {
      this.mode.set('dark');
      return;
    }
    this.apply(this.savedSeed(), this.savedMode());
  }

  savedSeed(): string {
    return localStorage.getItem(STORAGE_KEYS.paletteSeed) ?? PaletteService.DEFAULT_SEED;
  }

  savedMode(): ThemeMode {
    return (localStorage.getItem(STORAGE_KEYS.paletteMode) as ThemeMode) ?? 'dark';
  }

  /** Regenerate with a new seed, keeping the current mode. */
  setSeed(seedHex: string): void {
    this.apply(seedHex, this.mode());
  }

  /** Switch light/dark/system, keeping the current seed. */
  setMode(mode: ThemeMode): void {
    this.apply(this.savedSeed(), mode);
  }

  /** Generate the scheme(s) from `seedHex` for `mode`, apply, and persist. */
  apply(seedHex: string, mode: ThemeMode): void {
    const source = Hct.fromInt(argbFromHex(seedHex));
    const root = document.documentElement;
    this.clearOverrides();

    if (mode === 'system') {
      const light = this.tokens(source, false);
      const dark = this.tokens(source, true);
      this.styleElement().textContent =
        `:root{${declarations(light)}}` +
        `@media (prefers-color-scheme: dark){:root{${declarations(dark)}}}`;
      root.style.colorScheme = 'light dark';
    } else {
      for (const [token, value] of this.tokens(source, mode === 'dark')) {
        root.style.setProperty(token, value);
      }
      root.style.colorScheme = mode;
    }

    this.mode.set(mode);
    localStorage.setItem(STORAGE_KEYS.paletteSeed, seedHex);
    localStorage.setItem(STORAGE_KEYS.paletteMode, mode);
  }

  /** Clear the custom seed/mode, reverting to the stylesheet's base theme. */
  reset(): void {
    localStorage.removeItem(STORAGE_KEYS.paletteSeed);
    localStorage.removeItem(STORAGE_KEYS.paletteMode);
    this.clearOverrides();
    document.documentElement.style.removeProperty('color-scheme');
    this.mode.set('dark');
  }

  private tokens(source: Hct, dark: boolean): [string, string][] {
    const scheme = new SchemeTonalSpot(source, dark, 0);
    return PaletteService.ROLES.map(([token, role]) => {
      const color = MaterialDynamicColors[role] as DynamicColor;
      return [`--mat-sys-${token}`, hexFromArgb(color.getArgb(scheme))];
    });
  }

  private clearOverrides(): void {
    const root = document.documentElement;
    for (const [token] of PaletteService.ROLES) root.style.removeProperty(`--mat-sys-${token}`);
    const existing = document.getElementById(PaletteService.STYLE_ID);
    if (existing) existing.textContent = '';
  }

  private styleElement(): HTMLStyleElement {
    let element = document.getElementById(PaletteService.STYLE_ID) as HTMLStyleElement | null;
    if (!element) {
      element = document.createElement('style');
      element.id = PaletteService.STYLE_ID;
      document.head.appendChild(element);
    }
    return element;
  }
}

function declarations(tokens: [string, string][]): string {
  return tokens.map(([token, value]) => `${token}:${value};`).join('');
}
