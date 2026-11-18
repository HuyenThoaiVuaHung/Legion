import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ConnectionStatus, NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';

/**
 * Single-player scoreboard overlay: one contestant's name and score, picked
 * by the (0-based) `:id` route param bound via withComponentInputBinding.
 */
@Component({
  selector: 'app-single-point-ts',
  templateUrl: './single-point-ts.component.html',
  styleUrl: './single-point-ts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SinglePointTsComponent {
  private readonly session = inject(SessionService);
  private readonly network = inject(NetworkService);

  readonly id = input('');

  private readonly playerIndex = computed(() => Number(this.id()));
  readonly player = computed(() => this.session.match()?.players[this.playerIndex()] ?? null);

  constructor() {
    if (this.network.status() === ConnectionStatus.Disconnected) {
      void this.session.connect(this.network.serverUrl());
    }
  }
}
