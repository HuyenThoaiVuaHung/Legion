import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbar } from '@angular/material/toolbar';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { POSITION_LABELS } from '../core/constants';
import { MatchPosition } from '../core/contracts/game';
import { ApiService } from '../core/services/api.service';
import { AssetService } from '../core/services/asset.service';
import { SessionService } from '../core/services/session.service';

/** One round-control destination in the admin tab navigation. */
interface NavItem {
  route: string;
  label: string;
  icon: string;
  /** The dashboard link must match exactly; round links match by prefix. */
  exact?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { route: '/admin/dashboard', label: 'Tổng quan', icon: 'dashboard', exact: true },
  { route: '/admin/kd', label: 'Khởi động', icon: 'grass' },
  { route: '/admin/vcnv', label: 'Vượt chướng ngại vật', icon: 'landscape' },
  { route: '/admin/tt', label: 'Tăng tốc', icon: 'rocket_launch' },
  { route: '/admin/vd', label: 'Về đích', icon: 'military_tech' },
  { route: '/admin/chp', label: 'Câu hỏi phụ', icon: 'workspaces' },
];

/** Shell for the admin control panels: toolbar + tab navigation + points toggle. */
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatToolbar,
    MatTabsModule,
    MatIcon,
    MatIconButton,
    MatButton,
    MatTooltip,
  ],
})
export class AdminComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  protected readonly session = inject(SessionService);
  protected readonly assets = inject(AssetService);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly roomOwner = signal(false);

  constructor() {
    effect(() => {
      const roomId = this.session.createdRoomAdmin() ? this.session.roomId() : null;
      this.roomOwner.set(false);
      if (roomId) void this.api.me().then((profile) => {
        if (this.session.roomId() === roomId) this.roomOwner.set(profile.rooms.some((room) => room.roomId === roomId));
      }).catch(() => undefined);
    });
  }

  async exportRoom(): Promise<void> {
    try {
      const url = URL.createObjectURL(await this.api.exportLegion());
      const link = document.createElement('a'); link.href = url; link.download = 'match.legion'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      this.snackBar.open(error instanceof HttpErrorResponse && typeof error.error?.error === 'string' ? error.error.error : 'Không thể xuất phòng.', 'Đóng');
    }
  }

  protected readonly navItems = NAV_ITEMS;

  protected readonly positionLabel = computed(() => {
    const position = this.session.match()?.position;
    return position ? POSITION_LABELS[position] : '';
  });

  protected readonly showingPoints = computed(() => this.session.match()?.position === 'PNTS');

  /** Position to restore when leaving the scoreboard. */
  private positionBeforePoints: MatchPosition = 'H';

  /** Drop the admin session and return to the connect/login screen. */
  logout(): void {
    this.session.logout();
    void this.router.navigate(['/']);
  }

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
