import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-points-view',
  templateUrl: './points-view.component.html',
  styleUrl: './points-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class PointsViewComponent {
  protected readonly session = inject(SessionService);
}
