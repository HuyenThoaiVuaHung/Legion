import { Component } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-player",
  templateUrl: "./player.component.html",
  styleUrl: "./player.component.scss",
})
export class PlayerComponent {
  isBlocked: boolean = true;

  constructor(private matSnackbar: MatSnackBar) {
    this.showSnackbar(undefined);
    const blockedWarn = setInterval(() => {
      this.showSnackbar(blockedWarn);
    }, 5000);
  }
  private showSnackbar(interval: any) {
    if (this.isBlocked) {
      const ref = this.matSnackbar.open(
        "Vui lòng nhấn cho phép bật âm thanh.",
        "OK",
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
