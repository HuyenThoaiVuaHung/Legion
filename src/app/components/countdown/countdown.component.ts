import { Component, effect, input, Signal, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'countdown',
    templateUrl: './countdown.component.html',
    styleUrl: './countdown.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        MatProgressSpinnerModule
    ]
})
export class CountdownComponent {
  public maxTime: Signal<number> = input(0);
  public currentTime: Signal<number> = input(0);
}
