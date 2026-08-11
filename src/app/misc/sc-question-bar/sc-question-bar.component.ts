import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { RoundDataMap } from '../../core/contracts/game';
import { ApiService } from '../../core/services/api.service';
import { ConnectionStatus, NetworkService } from '../../core/services/network.service';
import { SessionService } from '../../core/services/session.service';

/**
 * VD (Về đích) broadcast overlay: shows which point-value packages have
 * already been picked.
 */
@Component({
  selector: 'app-sc-question-bar',
  templateUrl: './sc-question-bar.component.html',
  styleUrl: './sc-question-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCheckbox],
})
export class ScQuestionBarComponent {
  private readonly session = inject(SessionService);
  private readonly network = inject(NetworkService);
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly round = signal<RoundDataMap['vd'] | null>(null);

  constructor() {
    if (this.network.status() === ConnectionStatus.Disconnected) {
      void this.session.connect(this.network.serverUrl());
    }

    void this.api.getRound('vd').then((round) => this.round.set(round));

    const unsub = this.network.on<[RoundDataMap['vd']]>('update-vedich-data', (round) =>
      this.round.set(round),
    );
    this.destroyRef.onDestroy(unsub);
  }
}
