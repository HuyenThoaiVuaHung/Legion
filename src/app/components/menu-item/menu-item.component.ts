import { CommonModule } from "@angular/common";
import { Component, input, Signal, ChangeDetectionStrategy } from "@angular/core";

@Component({
    selector: "menu-item",
    templateUrl: "./menu-item.component.html",
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: "./menu-item.component.scss"
})
export class MenuItemComponent {
  public description: Signal<string> = input("");
  public title: Signal<string> = input("");
  public orientation: Signal<"vertical" | "horizontal"> = input("horizontal");
}
