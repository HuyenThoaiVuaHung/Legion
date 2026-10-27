import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepper, MatStep, MatStepperNext, MatStepperIcon } from '@angular/material/stepper';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { Role } from '../core/contracts/api';
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
  ],
})
export class HomeComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
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

  /** The saved default server, if the operator has connected here before. */
  protected readonly defaultUrl = computed(() => this.network.serverUrl());

  /** The home screen is the sign-out point: anyone landing here is logged out. */
  ngOnInit(): void {
    this.session.logout();
  }

  async connect(): Promise<void> {
    const url = this.urlForm.controls.serverUrl.value ?? '';
    await this.session.connect(url);
  }

  /** Open the independent local editor without connecting to Legendary. */
  openEditor(): void {
    void this.router.navigateByUrl('/editor');
  }

  /** One-click viewer join on the saved connection — no secret needed. */
  async joinAsViewer(): Promise<void> {
    const url = this.defaultUrl();
    if (!url) return;
    await this.session.connect(url);
    await this.session.login('');
  }

  /** Set this device up as the audience/projector screen. */
  async setupBackScreen(): Promise<void> {
    await this.joinAsViewer();
    await this.screen.presentHere();
  }

  async login(): Promise<void> {
    const secret = this.secretForm.controls.secret.value ?? '';
    const role = await this.session.login(secret);
    if (role === Role.Admin) void this.router.navigateByUrl('/admin');
    else if (role === Role.Mc) void this.router.navigateByUrl('/mc');
  }
}
