import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { STORAGE_KEYS } from '../core/constants';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-host-auth', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButton, MatFormField, MatLabel, MatInput],
  template: `<main class="p-8 max-w-lg mx-auto">
    <h1>Ch? ph?ng</h1>
    @if (recoveryCode()) {
      <h2>L?u m? kh?i ph?c</h2>
      <p>M? n?y ch? hi?n th? m?t l?n. H?y l?u ? n?i an to?n.</p>
      <p><strong>{{ recoveryCode() }}</strong></p>
      @if (error()) { <p role="alert">{{ error() }}</p> }
      <button mat-stroked-button (click)="copy()">{{ copied() ? '?? sao ch?p' : 'Sao ch?p' }}</button>
      <button mat-flat-button (click)="confirmSaved()">T?i ?? l?u m?</button>
    } @else {
      <div class="flex gap-2 mb-4">
        <button mat-button (click)="mode.set('login')">??ng nh?p</button>
        <button mat-button (click)="mode.set('signup')">??ng k?</button>
        <button mat-button (click)="mode.set('recover')">Kh?i ph?c</button>
      </div>
      <form (ngSubmit)="submit()" class="flex flex-col gap-2">
        <mat-form-field><mat-label>T?n t?i kho?n</mat-label><input matInput name="username" [(ngModel)]="username" required /></mat-form-field>
        @if (mode() === 'recover') {
          <mat-form-field><mat-label>M? kh?i ph?c</mat-label><input matInput name="code" [(ngModel)]="code" required /></mat-form-field>
        }
        <mat-form-field><mat-label>{{ mode() === 'recover' ? 'M?t kh?u m?i' : 'M?t kh?u' }}</mat-label><input matInput type="password" name="password" [(ngModel)]="password" required /></mat-form-field>
        @if (error()) { <p role="alert">{{ error() }}</p> }
        <button mat-flat-button type="submit" [disabled]="busy()">{{ mode() === 'signup' ? '??ng k?' : mode() === 'recover' ? 'Kh?i ph?c' : '??ng nh?p' }}</button>
      </form>
    }
  </main>`,
})
export class HostAuthComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  protected readonly mode = signal<'login' | 'signup' | 'recover'>('login');
  protected readonly recoveryCode = signal('');
  protected readonly copied = signal(false);
  protected readonly error = signal('');
  protected readonly busy = signal(false);
  protected username = ''; protected password = ''; protected code = '';
  async submit(): Promise<void> {
    this.busy.set(true); this.error.set('');
    try {
      const result = this.mode() === 'signup' ? await this.api.signup({ username: this.username, password: this.password }) :
        this.mode() === 'recover' ? await this.api.recoverAccount({ username: this.username, recoveryCode: this.code, newPassword: this.password }) :
        await this.api.accountLogin({ username: this.username, password: this.password });
      localStorage.setItem(STORAGE_KEYS.accountToken, result.token);
      if ('recoveryCode' in result && typeof result.recoveryCode === 'string') this.recoveryCode.set(result.recoveryCode);
      else await this.router.navigateByUrl('/host');
    } catch { this.error.set('Kh?ng th? ??ng nh?p ho?c t?o t?i kho?n. H?y ki?m tra th?ng tin v? th? l?i.'); }
    finally { this.busy.set(false); }
  }
  async copy(): Promise<void> { try { await navigator.clipboard.writeText(this.recoveryCode()); this.copied.set(true); } catch { this.error.set('Kh?ng th? sao ch?p; h?y ghi l?i m?.'); } }
  confirmSaved(): void { this.recoveryCode.set(''); void this.router.navigateByUrl('/host'); }
}
