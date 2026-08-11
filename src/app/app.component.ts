import { Component, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { getControlUrlFromMatchPosition } from "./services/tools";
import { MatIconRegistry } from "@angular/material/icon";
@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  auth = inject(AuthService);
  private iconRegistry = inject(MatIconRegistry);

  title = "Legion";
  matchPosCache: string = "";

  constructor() {
    const iconRegistry = this.iconRegistry;

    iconRegistry.setDefaultFontSetClass('material-symbols-outlined')
  }
  ngOnInit(): void {}
}
