import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { PaletteService } from '../../core/services/palette.service';
import { ConfigService } from '../../core/services/config.service';

/** Preset seed colors offered as quick swatches beside the free picker. */
const PRESET_SEEDS = [
  '#7C4DFF', '#2962FF', '#00BFA5', '#00C853',
  '#FFD600', '#FF6D00', '#D50000', '#C51162',
] as const;

/**
 * Admin appearance screen: a Material-Theme-Builder-style seed picker that
 * regenerates the whole M3 palette live, plus a read-out of the server's
 * current game-rule knobs.
 */
@Component({
  selector: 'app-appearance',
  templateUrl: './appearance.component.html',
  styleUrl: './appearance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButton],
})
export class AppearanceComponent {
  private readonly palette = inject(PaletteService);
  protected readonly config = inject(ConfigService);

  protected readonly presets = PRESET_SEEDS;
  protected readonly seed = signal(this.palette.savedSeed());

  onSeedChange(hex: string): void {
    this.seed.set(hex);
    this.palette.apply(hex);
  }

  resetPalette(): void {
    this.palette.reset();
    this.seed.set(PaletteService.DEFAULT_SEED);
    this.palette.apply(PaletteService.DEFAULT_SEED);
  }
}
