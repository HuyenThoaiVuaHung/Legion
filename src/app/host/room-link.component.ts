import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '../core/contracts/api';
import { ApiService } from '../core/services/api.service';
import { SessionService } from '../core/services/session.service';
import { joinError } from './join-error';

@Component({
  selector: 'app-room-link', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButton, MatFormField, MatLabel, MatInput],
  template: `<main class="p-8 max-w-lg mx-auto">
    <h2>V?o ph?ng {{ code }}</h2>
    @if (needUsername()) {
      <mat-form-field class="w-full"><mat-label>T?n ng??i ch?i</mat-label><input matInput [(ngModel)]="username" maxlength="32" /></mat-form-field>
      <button mat-flat-button (click)="join()">V?o ph?ng</button>
    } @else if (!error()) { <p>?ang k?t n?i...</p> }
    @if (error()) { <p role="alert">{{ error() }}</p><button mat-button (click)="join()">Th? l?i</button> }
  </main>`,
})
export class RoomLinkComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);
  readonly code = this.route.snapshot.paramMap.get('code') ?? '';
  private readonly view = this.route.snapshot.paramMap.get('view');
  private readonly token = new URLSearchParams(window.location.hash.slice(1)).get('k');
  protected readonly needUsername = signal(false);
  protected readonly error = signal('');
  protected username = '';

  constructor() {
    if (window.location.hash) history.replaceState(history.state, '', window.location.pathname + window.location.search);
    void this.start();
  }
  private async start(): Promise<void> {
    try { await this.session.connect(window.location.origin); await this.join(); }
    catch { this.error.set('Kh?ng th? k?t n?i t?i m?y ch?.'); }
  }
  async join(): Promise<void> {
    this.error.set('');
    try {
      const result = this.token
        ? await this.api.joinLink({ token: this.token, username: this.username || undefined })
        : await this.api.joinRoom({ code: this.code });
      this.session.followMatch.set(!this.view);
      await this.session.acceptRoomSession(result);
      const views: Record<string, string> = {
        'sc-khoi-dong': '/misc/sc-khoi-dong', 'sc-question-bar': '/misc/sc-question-bar',
        'sc-ve-dich': '/misc/sc-ve-dich', 'kd': '/player/kd', 'vcnv-q': '/player/vcnv-q',
        'vcnv-a': '/player/vcnv-a', 'tangtoc-q': '/player/tangtoc-q',
        'tangtoc-a': '/player/tangtoc-a', 'vd': '/player/vd', 'chp': '/player/chp', 'points': '/player/points',
      };
      const target = this.view ? (views[this.view] ?? '/player/points') :
        result.roleId === Role.Admin ? '/admin' : result.roleId === Role.Mc ? '/mc' : '/player/points';
      await this.router.navigateByUrl(target);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 400 && /username/i.test(error.error?.error ?? '')) this.needUsername.set(true);
      this.error.set(joinError(error));
    }
  }
}
