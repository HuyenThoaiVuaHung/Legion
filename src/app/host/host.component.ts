import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { STORAGE_KEYS } from '../core/constants';
import { AccountProfile, BankItem } from '../core/contracts/api';
import { ApiService } from '../core/services/api.service';
import { SessionService } from '../core/services/session.service';

@Component({
  selector: 'app-host', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButton, MatFormField, MatLabel, MatInput, MatProgressBar],
  template: `<main class="p-8 max-w-4xl mx-auto flex flex-col gap-6">
    <div class="flex justify-between items-center"><h1>Ch? ph?ng {{ profile()?.username }}</h1><button mat-button (click)="logout()">??ng xu?t</button></div>
    @if (error()) { <p role="alert">{{ error() }}</p> }
    <section><h2>Ph?ng c?a b?n</h2>
      <button mat-flat-button [disabled]="busy()" (click)="create()">T?o ph?ng tr?ng</button>
      @for (room of profile()?.rooms ?? []; track room.roomId) {
        <div class="flex items-center gap-4 py-3 border-b"><strong>{{ room.code }}</strong><span>T?o l?c {{ date(room.createdAt) }}</span><button mat-stroked-button (click)="enter(room.roomId)">V?o qu?n tr?</button></div>
      } @empty { <p>Ch?a c? ph?ng n?o.</p> }
    </section>
    <section><h2>Ng?n h?ng tr?n ??u</h2>
      <p>{{ formatBytes(bank()?.usedBytes ?? 0) }} / {{ formatBytes(bank()?.maxBytes ?? 0) }} ? {{ bank()?.items?.length ?? 0 }} / {{ bank()?.maxItems ?? 0 }} t?p</p>
      <mat-progress-bar mode="determinate" [value]="usage()"></mat-progress-bar>
      <label class="block my-4">T?i l?n t?p .legion <input type="file" accept=".legion,.lg" (change)="upload($event)" /></label>
      @for (item of bank()?.items ?? []; track item.id) {
        <div class="py-3 border-b flex flex-wrap items-center gap-2">
          <strong>{{ item.name }}</strong><span>{{ formatBytes(item.sizeBytes) }}</span>
          <button mat-button (click)="download(item)">T?i xu?ng</button>
          <button mat-button (click)="startRename(item)">??i t?n</button>
          <button mat-button (click)="remove(item)">X?a</button>
          <button mat-stroked-button [disabled]="busy()" (click)="create(item.id)">T?o ph?ng t? t?p</button>
          @if (renaming() === item.id) {
            <mat-form-field><mat-label>T?n m?i</mat-label><input matInput [(ngModel)]="newName" /></mat-form-field>
            <button mat-button (click)="rename(item)">L?u</button><button mat-button (click)="renaming.set('')">H?y</button>
          }
        </div>
      } @empty { <p>Ch?a c? t?p n?o.</p> }
    </section>
  </main>`,
})
export class HostComponent {
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  protected readonly profile = signal<AccountProfile | null>(null);
  protected readonly bank = signal<{ items: BankItem[]; usedBytes: number; maxBytes: number; maxItems: number } | null>(null);
  protected readonly error = signal('');
  protected readonly busy = signal(false);
  protected readonly renaming = signal('');
  protected newName = '';
  constructor() { void this.refresh(); }
  async refresh(): Promise<void> {
    try { const [profile, bank] = await Promise.all([this.api.me(), this.api.bank()]); this.profile.set(profile); this.bank.set(bank); }
    catch (error) { if (error instanceof HttpErrorResponse && error.status === 401) { localStorage.removeItem(STORAGE_KEYS.accountToken); void this.router.navigateByUrl('/host/auth'); } else this.error.set('Kh?ng th? t?i th?ng tin ch? ph?ng.'); }
  }
  usage(): number { const b = this.bank(); return b?.maxBytes ? Math.min(100, b.usedBytes / b.maxBytes * 100) : 0; }
  formatBytes(n: number): string { return n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`; }
  date(n: number): string { return new Date(n).toLocaleString('vi-VN'); }
  private async perform(action: () => Promise<void>): Promise<void> {
    this.busy.set(true); this.error.set('');
    try { await action(); } catch (error) { this.error.set(error instanceof HttpErrorResponse && error.status === 413 ? 'T?p qu? l?n ho?c ng?n h?ng ?? ??y.' : 'Thao t?c kh?ng th?nh c?ng. Vui l?ng th? l?i.'); }
    finally { this.busy.set(false); }
  }
  async create(id?: string): Promise<void> { await this.perform(async () => { await this.api.createRoom(id); await this.refresh(); }); }
  async enter(id: string): Promise<void> { await this.perform(async () => { const result = await this.api.enterRoom(id); await this.session.acceptRoomSession(result); await this.router.navigateByUrl('/admin'); }); }
  async upload(event: Event): Promise<void> { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return; await this.perform(async () => { await this.api.uploadBank(file); await this.refresh(); }); input.value = ''; }
  async download(item: BankItem): Promise<void> { await this.perform(async () => { const blob = await this.api.downloadBank(item.id); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${item.name}.legion`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }); }
  startRename(item: BankItem): void { this.newName = item.name; this.renaming.set(item.id); }
  async rename(item: BankItem): Promise<void> { await this.perform(async () => { await this.api.renameBank(item.id, this.newName); this.renaming.set(''); await this.refresh(); }); }
  async remove(item: BankItem): Promise<void> { if (!confirm(`X?a t?p ?${item.name}??`)) return; await this.perform(async () => { await this.api.deleteBank(item.id); await this.refresh(); }); }
  async logout(): Promise<void> { try { await this.api.accountLogout(); } finally { localStorage.removeItem(STORAGE_KEYS.accountToken); await this.router.navigateByUrl('/host/auth'); } }
}
