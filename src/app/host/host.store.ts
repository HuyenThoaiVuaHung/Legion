import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NameDialogComponent, NameDialogData } from '../components/name-dialog/name-dialog.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../components/operator-dialog/confirmation-dialog.component';
import { STORAGE_KEYS } from '../core/constants';
import { AccountProfile, BankItem, OwnedRoom, Role } from '../core/contracts/api';
import { ApiService } from '../core/services/api.service';
import { SessionService } from '../core/services/session.service';
import { CreateRoomDialogComponent } from './create-room-dialog.component';

export interface BankState { items: BankItem[]; usedBytes: number; maxBytes: number; maxItems: number }

@Injectable({ providedIn: 'root' })
export class HostStore {
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly profile = signal<AccountProfile | null>(null);
  readonly bank = signal<BankState | null>(null);
  readonly error = signal('');
  readonly busy = signal(false);

  async refresh(): Promise<void> {
    try {
      const [profile, bank] = await Promise.all([this.api.me(), this.api.bank()]);
      this.profile.set(profile);
      this.bank.set(bank);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) await this.signedOut();
      else this.error.set('Không thể tải thông tin chủ phòng.');
    }
  }

  async logout(): Promise<void> {
    try { await this.api.accountLogout(); } finally { await this.signedOut(); }
  }
  private async signedOut(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.accountToken);
    this.profile.set(null);
    this.bank.set(null);
    await this.router.navigateByUrl('/');
  }

  usage(): number { const b = this.bank(); return b?.maxBytes ? Math.min(100, b.usedBytes / b.maxBytes * 100) : 0; }
  formatBytes(n: number): string { return n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`; }
  date(n: number): string { return new Date(n).toLocaleString('vi-VN'); }

  private async perform(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try { await action(); }
    catch (error) { this.error.set(error instanceof HttpErrorResponse && error.status === 413 ? 'Tệp quá lớn hoặc ngân hàng đã đầy.' : 'Thao tác không thành công. Vui lòng thử lại.'); }
    finally { this.busy.set(false); }
  }

  newRoom(): void {
    const items = this.bank()?.items ?? [];
    if (items.length === 0) { void this.create(); return; }
    this.dialog.open<CreateRoomDialogComponent, BankItem[], string>(CreateRoomDialogComponent, { width: '24rem', data: items })
      .afterClosed().subscribe((source) => { if (source !== undefined) void this.create(source || undefined); });
  }
  create(bankItemId?: string): Promise<void> {
    return this.perform(async () => { await this.api.createRoom(bankItemId); await this.refresh(); });
  }
  enter(room: OwnedRoom): Promise<void> {
    return this.perform(async () => {
      await this.session.acceptRoomSession(await this.api.enterRoom(room.roomId), room.code);
      await this.router.navigateByUrl(this.session.homeFor(Role.Admin));
    });
  }

  async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    await this.perform(async () => { await this.api.uploadBank(file); await this.refresh(); });
    input.value = '';
  }
  download(item: BankItem): Promise<void> {
    return this.perform(async () => {
      const url = URL.createObjectURL(await this.api.downloadBank(item.id));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.name}.legion`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
  rename(item: BankItem): void {
    this.dialog.open<NameDialogComponent, NameDialogData, string>(NameDialogComponent, { width: '24rem', data: { title: 'Đổi tên tệp', label: 'Tên mới', value: item.name } })
      .afterClosed().subscribe((name) => { if (name) void this.perform(async () => { await this.api.renameBank(item.id, name); await this.refresh(); }); });
  }
  remove(item: BankItem): void {
    this.dialog.open<ConfirmationDialogComponent, ConfirmationDialogData, boolean>(ConfirmationDialogComponent, { width: '24rem', data: { title: 'Xoá tệp', message: `Xoá tệp “${item.name}”?`, confirmLabel: 'Xoá' } })
      .afterClosed().subscribe((ok) => { if (ok) void this.perform(async () => { await this.api.deleteBank(item.id); await this.refresh(); }); });
  }
}
