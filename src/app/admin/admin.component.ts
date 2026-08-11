import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { POSITION_LABELS } from '../core/constants';
import { MatchPosition } from '../core/contracts/game';
import { ApiService } from '../core/services/api.service';
import { SessionService } from '../core/services/session.service';

/** Shell for the admin control panels: toolbar navigation + points toggle. */
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet, MatToolbarModule, MatIconModule, MatButtonModule],
})
export class AdminComponent {
  private readonly api = inject(ApiService);
  protected readonly session = inject(SessionService);

  protected readonly positionLabel = computed(() => {
    const position = this.session.match()?.position;
    return position ? POSITION_LABELS[position] : '';
  });

  /** Position to restore when leaving the scoreboard. */
  private positionBeforePoints: MatchPosition = 'H';

  async togglePoints(): Promise<void> {
    const position = this.session.match()?.position;
    if (!position) return;
    if (position === 'PNTS') {
      this.session.match.set(await this.api.setPosition(this.positionBeforePoints));
    } else {
      this.positionBeforePoints = position;
      this.session.match.set(await this.api.setPosition('PNTS'));
    }
  }
}
