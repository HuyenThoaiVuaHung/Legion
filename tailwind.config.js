/**
 * Tailwind runs alongside Angular Material. Color utilities are bridged to
 * Material's runtime system tokens so both systems always agree (and both
 * follow the active light/dark scheme automatically).
 */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--mat-sys-primary)',
        'on-primary': 'var(--mat-sys-on-primary)',
        'primary-container': 'var(--mat-sys-primary-container)',
        'on-primary-container': 'var(--mat-sys-on-primary-container)',
        secondary: 'var(--mat-sys-secondary)',
        'on-secondary': 'var(--mat-sys-on-secondary)',
        tertiary: 'var(--mat-sys-tertiary)',
        'on-tertiary': 'var(--mat-sys-on-tertiary)',
        error: 'var(--mat-sys-error)',
        'on-error': 'var(--mat-sys-on-error)',
        surface: 'var(--mat-sys-surface)',
        'on-surface': 'var(--mat-sys-on-surface)',
        'surface-container': 'var(--mat-sys-surface-container)',
        'surface-container-high': 'var(--mat-sys-surface-container-high)',
        'surface-container-low': 'var(--mat-sys-surface-container-low)',
        outline: 'var(--mat-sys-outline)',
        'outline-variant': 'var(--mat-sys-outline-variant)',
      },
    },
  },
  plugins: [],
};
