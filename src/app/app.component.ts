import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { getControlUrlFromMatchPosition } from "./services/tools";
import { MatIconRegistry } from "@angular/material/icon";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "Legion";
  matchPosCache: string = "";

  constructor(private router: Router, public auth: AuthService, private iconRegistry: MatIconRegistry) {
    iconRegistry.setDefaultFontSetClass('material-symbols-outlined')
  }
  ngOnInit(): void {}
}
