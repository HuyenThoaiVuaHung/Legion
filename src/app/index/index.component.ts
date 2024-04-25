import { NetworkingService } from './../services/networking.service';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { NetworkStatus } from '../services/networking.enum';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-index',
  standalone: true,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class IndexComponent implements OnInit {
  errorMsg: string = '';
  urlFormGroup = this._formBuilder.group({
    legendaryUrl: ['http://', [Validators.pattern(/(http:\x2f\x2f)[A-Za-z0-9.\x2f:]+/)]]
  });
  tokenFormGroup = this._formBuilder.group({
    token: ['', [Validators.required]]
  });

  _networkStatus = NetworkStatus;
  constructor(private _formBuilder: FormBuilder, public network: NetworkingService) { }
  ngOnInit(): void {
    if (localStorage.getItem('defaultUrl')) {
      this.urlFormGroup.setValue({
        legendaryUrl: localStorage.getItem('defaultUrl')
      });
      this.network.connect(localStorage.getItem('defaultUrl')!);
    }
  }
  connect() {
    if (localStorage.getItem('defaultUrl') !== this.urlFormGroup.value.legendaryUrl) {
      this.network.connect(this.urlFormGroup.value.legendaryUrl!);
    }
  }
  login() {

  }
}


