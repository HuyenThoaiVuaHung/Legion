import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { STORAGE_KEYS } from '../core/constants';
import { ApiService } from '../core/services/api.service';

type AuthMode = 'login' | 'signup' | 'recover';

@Component({
  selector: 'app-host-login-dialog',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, MatButton, MatDialogModule, MatFormField, MatIcon, MatLabel, MatInput],
  templateUrl: './host-login-dialog.component.html',
})
export class HostLoginDialogComponent {
  private readonly api = inject(ApiService);
  private readonly ref = inject<MatDialogRef<HostLoginDialogComponent, boolean>>(MatDialogRef);

  protected readonly modes: readonly AuthMode[] = ['login', 'signup', 'recover'];
  protected readonly mode = signal<AuthMode>('login');
  protected readonly recoveryCode = signal('');
  protected readonly copied = signal(false);
  protected readonly error = signal('');
  protected readonly busy = signal(false);
  protected username = '';
  protected password = '';
  protected code = '';

  protected readonly title: Record<AuthMode, string> = { login: 'Đăng nhập', signup: 'Đăng ký', recover: 'Khôi phục tài khoản' };
  protected readonly switchLabel: Record<AuthMode, string> = { login: 'Đăng nhập', signup: 'Đăng ký', recover: 'Quên mật khẩu' };
  protected readonly action: Record<AuthMode, string> = { login: 'Đăng nhập', signup: 'Đăng ký', recover: 'Khôi phục' };
  protected readonly actionIcon: Record<AuthMode, string> = { login: 'login', signup: 'person_add', recover: 'lock_reset' };

  constructor() {
    effect(() => { this.ref.disableClose = this.recoveryCode() !== ''; });
  }

  protected switchTo(mode: AuthMode): void { this.mode.set(mode); this.error.set(''); }

  async submit(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      const mode = this.mode();
      const result = mode === 'signup' ? await this.api.signup({ username: this.username, password: this.password })
        : mode === 'recover' ? await this.api.recoverAccount({ username: this.username, recoveryCode: this.code, newPassword: this.password })
        : await this.api.accountLogin({ username: this.username, password: this.password });
      localStorage.setItem(STORAGE_KEYS.accountToken, result.token);
      if ('recoveryCode' in result && typeof result.recoveryCode === 'string') this.recoveryCode.set(result.recoveryCode);
      else this.ref.close(true);
    } catch {
      this.error.set('Không thể đăng nhập hoặc tạo tài khoản. Hãy kiểm tra thông tin và thử lại.');
    } finally {
      this.busy.set(false);
    }
  }

  async copy(): Promise<void> {
    try { await navigator.clipboard.writeText(this.recoveryCode()); this.copied.set(true); }
    catch { this.error.set('Không thể sao chép; hãy ghi lại mã.'); }
  }

  protected saved(): void { this.ref.close(true); }
}
