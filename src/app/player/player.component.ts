import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Shell for every player/viewer screen. Browsers block audio autoplay until
 * the user interacts with the page at least once, so this shows a one-shot
 * overlay hint instead of the old code's self-rescheduling snackbar (which
 * kept re-showing itself every 5s via a setInterval closure bug even after
 * the audio had already been unlocked on a previous route).
 */
@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
})
export class PlayerComponent {
  readonly audioBlocked = signal(true);

  unlockAudio(): void {
    this.audioBlocked.set(false);
  }
}
