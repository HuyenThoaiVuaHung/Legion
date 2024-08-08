import { Component, input, Signal } from '@angular/core';

@Component({
  selector: 'menu-item',
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss'
})
export class MenuItemComponent {
  public description: Signal<string> = input('');
  public title: Signal<string> = input('');
}
