import { Component, ChangeDetectionStrategy, inject } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: "app-player",
    templateUrl: "./player.component.html",
    styleUrl: "./player.component.scss",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PlayerComponent {
  private matSnackbar = inject(MatSnackBar);

  isBlocked: boolean = true;

  constructor() {
    this.showSnackbar(undefined);
    const blockedWarn = setInterval(() => {
      this.showSnackbar(blockedWarn);
    }, 5000);
  }
  private showSnackbar(interval: any) {
    if (this.isBlocked) {
      const ref = this.matSnackbar.open(
        "Vui lòng nhấn vào màn hình để cho phép bật âm thanh.",
        undefined,
        {
          duration: 2000,
          horizontalPosition: "end",
        }
      );
      ref.onAction().subscribe(() => {
        this.isBlocked = false;
        ref.dismiss();
      });
    } else clearInterval(interval);
  }
}
