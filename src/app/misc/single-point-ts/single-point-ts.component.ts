import { ActivatedRoute } from "@angular/router";
import { Component, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import { MatchData } from "src/app/services/types/match.data";
import { AuthService } from "src/app/services/auth.service";

@Component({
    selector: "app-single-point-ts",
    templateUrl: "./single-point-ts.component.html",
    styleUrls: ["./single-point-ts.component.scss"],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class SinglePointTsComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  auth = inject(AuthService);

  constructor() {
    if (!localStorage.getItem("defaultUrl"))
      this.auth.connect(
        document.URL.match(/(http:\x2f\x2f)[A-Za-z0-9\.]+/)![0]
      );
  }
  public index = -1;
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (params["id"]) {
        this.index = +params["id"];
      }
    });
  }
}
