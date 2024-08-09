import { CommonModule } from "@angular/common";
import { Component, input, Signal } from "@angular/core";

@Component({
  selector: "menu-item",
  templateUrl: "./menu-item.component.html",
  standalone: true,
  imports: [CommonModule],
  styleUrl: "./menu-item.component.scss",
})
export class MenuItemComponent {
  public description: Signal<string> = input("");
  public title: Signal<string> = input("");
  public orientation: Signal<"vertical" | "horizontal"> = input("horizontal");
}
