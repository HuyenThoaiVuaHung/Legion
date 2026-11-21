import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Crumb, NavbarComponent } from '../components/navbar/navbar.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { POSITION_LABELS, STORAGE_KEYS } from '../core/constants';
import { MatchPosition } from '../core/contracts/game';
import { ApiService } from '../core/services/api.service';
import { SessionService } from '../core/services/session.service';

interface NavItem {
  route: string;
  label: string;
  icon: string;
  exact?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { route: 'admin/dashboard', label: 'Tổng quan', icon: 'dashboard', exact: true },
  { route: 'admin/kd', label: 'Khởi động', icon: 'grass' },
  { route: 'admin/vcnv', label: 'Vượt chướng ngại vật', icon: 'landscape' },
  { route: 'admin/tt', label: 'Tăng tốc', icon: 'rocket_launch' },
  { route: 'admin/vd', label: 'Về đích', icon: 'military_tech' },
  { route: 'admin/chp', label: 'Câu hỏi phụ', icon: 'workspaces' },
];

const SECTION_BY_SEGMENT: Record<string, string> = {
  ...Object.fromEntries(NAV_ITEMS.map((item) => [item.route.split('/').pop() ?? '', item.label])),
  appearance: 'Giao diện',
  room: 'Phòng',
};

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NavbarComponent,
    MatCardModule,
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
  private readonly snackBar = inject(MatSnackBar);
  protected readonly roomOwner = signal(false);
  protected readonly menuOpen = signal(localStorage.getItem(STORAGE_KEYS.adminSidebar) !== 'collapsed');
  private readonly url: Signal<string> = toSignal(this.router.events.pipe(filter((e) => e instanceof NavigationEnd), map((): string => this.router.url)), { initialValue: this.router.url });

  constructor() {
    effect(() => localStorage.setItem(STORAGE_KEYS.adminSidebar, this.menuOpen() ? 'open' : 'collapsed'));
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

  protected readonly menus = computed<readonly NavItem[]>(() =>
    [...NAV_ITEMS, ...(this.session.createdRoomAdmin() ? [{ route: 'admin/room', label: 'Phòng', icon: 'meeting_room' }] : []), { route: 'admin/appearance', label: 'Cài đặt & giao diện', icon: 'settings' }].map((item) => ({ ...item, route: this.session.base() + '/' + item.route })));

  protected readonly positionLabel = computed(() => {
    const position = this.session.match()?.position;
    return position ? POSITION_LABELS[position] : '';
  });

  protected readonly showingPoints = computed(() => this.session.match()?.position === 'PNTS');

  private positionBeforePoints: MatchPosition = 'H';

  protected readonly trail = computed<Crumb[]>(() => {
    const segment = this.url().split(/[?#]/)[0].split('/').filter(Boolean).pop() ?? 'dashboard';
    const section = SECTION_BY_SEGMENT[segment] ?? 'Tổng quan';
    if (!this.session.createdRoomAdmin()) return [{ label: 'Quản trị', link: this.session.base() + '/admin/dashboard' }, { label: section }];
    return [
      ...(this.roomOwner() ? [{ label: 'Chủ phòng', link: '/host' }] : []),
      { label: this.session.roomCode() ? 'Phòng ' + this.session.roomCode() : 'Phòng', link: this.session.base() + '/admin/dashboard' },
      { label: section },
    ];
  });

  protected readonly leaveLabel = computed(() => (this.roomOwner() ? 'Danh sách phòng' : this.session.createdRoomAdmin() ? 'Thoát phòng' : 'Đăng xuất'));

  protected readonly leaveIcon = computed(() => (this.roomOwner() ? 'arrow_back' : 'logout'));

  async leave(): Promise<void> {
    if (this.roomOwner()) { await this.router.navigateByUrl('/host'); return; }
    this.session.logout();
    await this.router.navigateByUrl('/');
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
