import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConfirmationDialogComponent } from '../../components/operator-dialog/confirmation-dialog.component';
import { STORAGE_KEYS } from '../../core/constants';
import { BankItem, LinkRole, RoomInfo, RoomLink, RoomSecrets, SpectatorMode } from '../../core/contracts/api';
import { ApiService } from '../../core/services/api.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-room', templateUrl: './room.component.html', styleUrl: './room.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, FormsModule, MatButton, MatCardModule, MatFormFieldModule, MatInput, MatProgressBar, MatSelectModule, MatSlideToggle],
})
export class RoomComponent {
  private readonly api = inject(ApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly session = inject(SessionService);
  protected readonly room = signal<RoomInfo | null>(null);
  protected readonly links = signal<RoomLink[]>([]);
  protected readonly bank = signal<BankItem[]>([]);
  protected readonly owner = signal(false);
  protected readonly now = signal(Date.now());
  protected readonly revealed = signal<Partial<Record<keyof RoomSecrets, boolean>>>({});
  protected readonly roles: readonly { key: keyof RoomSecrets; label: string }[] = [
    { key: 'admin', label: 'Quản trị' }, { key: 'mc', label: 'MC' },
    { key: 'player', label: 'Thí sinh' }, { key: 'spectator', label: 'Khán giả' },
  ];
  protected readonly countdown = computed(() => {
    const expiry = this.session.roomExpiring() ?? this.room()?.expiresAt;
    if (!expiry) return 'Không xác định';
    const seconds = Math.max(0, Math.ceil((expiry - this.now()) / 1000));
    return `${Math.floor(seconds / 86400)} ngày ${Math.floor(seconds % 86400 / 3600)} giờ ${Math.floor(seconds % 3600 / 60)} phút ${seconds % 60} giây`;
  });
  protected role: LinkRole = 'viewer';
  protected view = '';
  protected label = '';
  protected expiryHours: number | null = null;
  protected singleUse = false;
  protected newLink = signal('');
  protected username = '';
  protected bankItemId = '';
  protected bankName = '';

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
    void this.load();
  }
  private error(error: unknown): void {
    const message = error instanceof HttpErrorResponse && typeof error.error?.error === 'string' ? error.error.error : 'Không thể thực hiện thao tác.';
    this.snackBar.open(message, 'Đóng');
  }
  private async confirm(title: string, message: string, confirmLabel: string): Promise<boolean> {
    return !!(await firstValueFrom(this.dialog.open(ConfirmationDialogComponent, { data: { title, message, confirmLabel } }).afterClosed()));
  }
  async load(): Promise<void> {
    try {
      const [room, links] = await Promise.all([this.api.currentRoom(), this.api.roomLinks()]);
      this.room.set(room);
      this.links.set(links);
      this.owner.set(false);
      if (localStorage.getItem(STORAGE_KEYS.accountToken)) {
        const profile = await this.api.me();
        this.owner.set(profile.accountId === room.ownerAccountId && profile.rooms.some((item) => item.roomId === room.roomId));
        if (this.owner()) this.bank.set((await this.api.bank()).items);
      }
      if (this.owner() && this.route.snapshot.fragment === 'bank') {
        setTimeout(() => document.getElementById('bank')?.scrollIntoView({ behavior: 'smooth' }));
      }
    } catch (error) { this.error(error); }
  }
  async copy(value: string): Promise<void> {
    try { await navigator.clipboard.writeText(value); this.snackBar.open('Đã sao chép.', 'Đóng'); }
    catch { this.snackBar.open('Không thể sao chép.', 'Đóng'); }
  }
  spectatorUrl(code: string): string { return `${window.location.origin}/r/${encodeURIComponent(code)}`; }
  toggleSecret(role: keyof RoomSecrets): void { this.revealed.update((v) => ({ ...v, [role]: !v[role] })); }
  async rotate(role: keyof RoomSecrets): Promise<void> {
    if (!await this.confirm('Đổi mã bí mật', 'Các phiên dùng mã này sẽ bị thu hồi. Tiếp tục?', 'Đổi')) return;
    try { await this.api.rotateSecret(role); await this.load(); } catch (error) { this.error(error); }
  }
  async release(index: number): Promise<void> {
    if (!await this.confirm('Giải phóng chỗ', 'Phiên của thí sinh tại chỗ này sẽ bị thu hồi.', 'Giải phóng')) return;
    try { await this.api.releaseSeat(index); await this.load(); } catch (error) { this.error(error); }
  }
  async setMode(spectatorMode: SpectatorMode): Promise<void> {
    try { await this.api.roomSettings({ spectatorMode }); await this.load(); } catch (error) { this.error(error); await this.load(); }
  }
  async createLink(): Promise<void> {
    if (!this.label.trim() || (this.expiryHours !== null && (!Number.isFinite(this.expiryHours) || this.expiryHours <= 0))) {
      this.snackBar.open('Nhập nhãn và thời hạn hợp lệ.', 'Đóng'); return;
    }
    try {
      const result = await this.api.createRoomLink({ role: this.role, label: this.label.trim(), view: this.view.trim() || undefined, expiresInSeconds: this.expiryHours === null ? undefined : this.expiryHours * 3600, singleUse: this.singleUse });
      this.newLink.set(window.location.origin + result.path);
      this.links.set(await this.api.roomLinks());
    } catch (error) { this.error(error); }
  }
  async revoke(id: string): Promise<void> {
    if (!await this.confirm('Thu hồi liên kết', 'Các phiên dùng liên kết này sẽ bị thu hồi.', 'Thu hồi')) return;
    try { await this.api.deleteRoomLink(id); this.links.set(await this.api.roomLinks()); } catch (error) { this.error(error); }
  }
  async save(): Promise<void> {
    if (this.bankItemId && !await this.confirm('Thay bản lưu', 'Bản lưu trong ngân hàng sẽ bị ghi đè.', 'Thay thế')) return;
    try {
      await this.api.saveToBank(this.bankItemId ? { bankItemId: this.bankItemId } : (this.bankName.trim() ? { name: this.bankName.trim() } : {}));
      this.bank.set((await this.api.bank()).items);
      this.snackBar.open('Đã lưu vào ngân hàng.', 'Đóng');
    } catch (error) { this.error(error); }
  }
  async transfer(): Promise<void> {
    const username = this.username.trim();
    if (!username || !await this.confirm('Chuyển phòng', `Chuyển quyền sở hữu cho ${username}? Phiên của bạn sẽ kết thúc.`, 'Chuyển')) return;
    try { await this.api.transferRoom(username); this.session.logout(); await this.router.navigateByUrl('/host'); } catch (error) { this.error(error); }
  }
  async close(): Promise<void> {
    if (!await this.confirm('Đóng phòng', 'Phòng và dữ liệu trong phòng sẽ bị xóa.', 'Tiếp tục')) return;
    if (!await this.confirm('Xác nhận đóng phòng', 'Bạn chắc chắn muốn đóng phòng? Thao tác này không thể hoàn tác.', 'Đóng phòng')) return;
    try { await this.api.closeRoom(); this.session.logout(); await this.router.navigateByUrl('/host'); } catch (error) { this.error(error); }
  }
}
