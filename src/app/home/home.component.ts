import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepper, MatStep, MatStepperNext, MatStepperIcon } from '@angular/material/stepper';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatCard, MatCardContent } from '@angular/material/card';
import { JoinRoomResponse, PublicRoom, Role } from '../core/contracts/api';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { EmptyStateComponent } from '../components/empty-state/empty-state.component';
import { HostLoginDialogComponent } from '../host/host-login-dialog.component';
import { STORAGE_KEYS } from '../core/constants';
import { queryParamState } from '../core/query-param';
import { RoomJoinDialogComponent } from './room-join-dialog.component';
import { ApiService } from '../core/services/api.service';
import { joinError } from '../host/join-error';
import { AssetService } from '../core/services/asset.service';
import { ConnectionStatus, NetworkService } from '../core/services/network.service';
import { ScreenService } from '../core/services/screen.service';
import { SessionService } from '../core/services/session.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatStepper,
    MatStep,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatButton,
    MatIcon,
    MatProgressSpinner,
    MatTooltip,
    MatStepperNext,
    MatStepperIcon,
    MatCard,
    MatCardContent,
    MatSuffix,
    NavbarComponent,
    EmptyStateComponent,
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly dialog = inject(MatDialog);
  protected readonly rooms = signal<PublicRoom[]>([]);
  private readonly search = queryParamState('search');
  protected readonly query = computed(() => this.search.value() ?? '');
  protected setQuery(value: string): void { this.search.set(value); }
  private stopWatching: (() => void) | null = null;
  private watchedUrl: string | null = null;

  protected readonly visibleRooms = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.rooms().filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)) : this.rooms();
  });
  protected readonly exactRoom = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.rooms().find((r) => r.code.toLowerCase() === q) : undefined;
  });
  protected readonly statusText: Record<PublicRoom['status'], string> = { waiting: 'Chờ bắt đầu', live: 'Đang diễn ra' };

  constructor() {
    effect(() => {
      const hosted = this.session.multiRoom();
      const url = this.network.serverUrl();
      if (!hosted) { this.unwatch(); return; }
      if (this.watchedUrl === url) return;
      this.unwatch();
      this.watchedUrl = url;
      this.stopWatching = this.network.watchRooms(url, (list) => this.rooms.set(list));
    });
  }

  ngOnDestroy(): void { this.unwatch(); }

  private unwatch(): void {
    this.stopWatching?.();
    this.stopWatching = null;
    this.watchedUrl = null;
  }

  protected openRoom(room: PublicRoom): void {
    this.dialog.open<RoomJoinDialogComponent, PublicRoom, JoinRoomResponse>(RoomJoinDialogComponent, { data: room, width: '24rem' })
      .afterClosed().subscribe(async (result) => {
        if (!result) return;
        this.session.followMatch.set(true);
        await this.session.acceptRoomSession(result, room.code);
        void this.router.navigateByUrl(this.session.homeFor(result.roleId));
      });
  }

  private readonly api = inject(ApiService);
  protected readonly joinMessage = signal('');
  protected readonly usernameNeeded = signal(false);
  protected readonly joinForm = inject(FormBuilder).group({ code: '', secret: '', username: '' });
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly network = inject(NetworkService);
  protected readonly session = inject(SessionService);
  protected readonly assets = inject(AssetService);
  private readonly screen = inject(ScreenService);

  protected readonly connectionStatus = ConnectionStatus;

  protected readonly urlForm = this.formBuilder.group({
    serverUrl: [
      this.network.serverUrl() || 'http://',
      [Validators.required, Validators.pattern(/^https?:\/\/[A-Za-z0-9.:/_-]+$/)],
    ],
  });
  protected readonly secretForm = this.formBuilder.group({
    secret: ['', [Validators.required]],
  });

  protected readonly greeting = computed(() => {
    switch (this.session.role()) {
      case Role.Player:
        return this.session.self()?.name ?? 'Chào bạn';
      case Role.Admin:
        return 'Ban tổ chức';
      case Role.Mc:
        return 'Người dẫn chương trình';
      case Role.Viewer:
        return 'Viewer';
      default:
        return 'Chào bạn';
    }
  });

  protected readonly defaultUrl = computed(() => this.network.serverUrl());

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.has('signin')) this.openHost();
    const join = this.route.snapshot.queryParamMap.get('join');
    void this.session.ready.then(() => {
      if (join) this.openRoom({ code: join, name: 'Phòng ' + join, status: 'waiting', guestAllowed: true });
      else if (!this.hostSignedIn()) this.session.logout();
      const url = this.network.serverUrl();
      if (url && !this.session.serverReady()) void this.session.connect(url).catch(() => undefined);
    });
  }

  async connect(): Promise<void> {
    const url = this.urlForm.controls.serverUrl.value ?? '';
    try { await this.session.connect(url); } catch { this.joinMessage.set('Không thể kết nối tới máy chủ.'); }
  }


  async joinAsViewer(): Promise<void> {
    const url = this.defaultUrl();
    if (!url) return;
    await this.session.connect(url);
    if (this.session.multiRoom()) return;
    await this.session.login('');
  }

  async setupBackScreen(): Promise<void> {
    await this.joinAsViewer();
    await this.screen.presentHere();
  }

  protected hostSignedIn(): boolean { return !!localStorage.getItem(STORAGE_KEYS.accountToken); }

  protected openHost(): void {
    if (this.hostSignedIn()) { void this.router.navigateByUrl('/host'); return; }
    this.dialog.open<HostLoginDialogComponent, void, boolean>(HostLoginDialogComponent, { width: '26rem', maxWidth: '95vw' })
      .afterClosed().subscribe((signedIn) => { if (signedIn) void this.router.navigateByUrl('/host'); });
  }

  async joinRoom(): Promise<void> {
    this.session.followMatch.set(true);
    const { code, secret, username } = this.joinForm.getRawValue();
    try {
      const result = await this.api.joinRoom({ code: code ?? '', secret: secret || undefined, username: username || undefined });
      await this.session.acceptRoomSession(result, code ?? undefined);
      void this.router.navigateByUrl(this.session.homeFor(result.roleId));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 400 && /username/i.test(error.error?.error ?? '')) this.usernameNeeded.set(true);
      this.joinMessage.set(joinError(error));
    }
  }

  async login(): Promise<void> {
    const secret = this.secretForm.controls.secret.value ?? '';
    const role = await this.session.login(secret);
    if (role === Role.Admin || role === Role.Mc) void this.router.navigateByUrl(this.session.homeFor(role));
  }
}
