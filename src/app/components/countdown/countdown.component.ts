import { Component, effect, input, Signal } from '@angular/core';

@Component({
  selector: 'countdown',
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.scss'
})
export class CountdownComponent {
  public maxTime: Signal<number> = input(0);
  public currentTime: Signal<number> = input(0);
}
