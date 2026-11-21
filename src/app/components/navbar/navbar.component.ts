import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AssetService } from '../../core/services/asset.service';
import { PaletteService } from '../../core/services/palette.service';

export interface Crumb {
  label: string;
  link?: string;
}

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, MatIcon],
  template: `
    <header class="w-full box-border px-10 py-4 flex items-center justify-between gap-5">
      <div class="flex items-center gap-1 min-w-0">
        <a routerLink="/" aria-label="Legion" class="mr-2">
          <img [src]="assets.brand('logo-long')" alt="Legion" class="h-10 w-auto object-contain" [class.logo-whiten]="dark()" />
        </a>
        <span class="mat-title-large flex items-center gap-1 min-w-0">
          @for (crumb of trail(); track $index) {
            <mat-icon class="opacity-50">chevron_right</mat-icon>
            @if (crumb.link) {
              <a class="no-underline !text-[var(--mat-sys-on-surface-variant)] hover:!text-[var(--mat-sys-on-surface)]" [routerLink]="crumb.link">{{ crumb.label }}</a>
            } @else {
              <strong>{{ crumb.label }}</strong>
            }
          }
        </span>
      </div>
      <nav class="flex items-center gap-2"><ng-content /></nav>
    </header>
  `,
  styles: `.logo-whiten { filter: brightness(0) invert(1); }`,
})
export class NavbarComponent {
  readonly trail = input<readonly Crumb[]>([]);
  protected readonly assets = inject(AssetService);
  private readonly palette = inject(PaletteService);
  protected readonly dark = computed(() => {
    const mode = this.palette.mode();
    return mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  });
}
