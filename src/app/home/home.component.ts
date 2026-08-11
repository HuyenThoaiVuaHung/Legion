import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepper, MatStep, MatStepperNext, MatStepperIcon } from '@angular/material/stepper';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Role } from '../core/contracts/api';
import { ConnectionStatus, NetworkService } from '../core/services/network.service';
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
    MatStepperNext,
    MatStepperIcon,
  ],
})
export class HomeComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly network = inject(NetworkService);
  protected readonly session = inject(SessionService);

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

  /** Display name for whoever is currently signed in, derived from session state only. */
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

  async connect(): Promise<void> {
    const url = this.urlForm.controls.serverUrl.value ?? '';
    await this.session.connect(url);
  }

  async login(): Promise<void> {
    const secret = this.secretForm.controls.secret.value ?? '';
    const role = await this.session.login(secret);
    if (role === Role.Admin) void this.router.navigateByUrl('/admin');
    else if (role === Role.Mc) void this.router.navigateByUrl('/mc');
  }
}
