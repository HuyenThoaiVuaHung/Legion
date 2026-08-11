import { Component, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { MatchData } from "src/app/services/types/match.data";
import { NgClass } from "@angular/common";

@Component({
    selector: "app-points-view",
    templateUrl: "./points-view.component.html",
    styleUrls: ["./points-view.component.scss"],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NgClass]
})
export class PointsViewComponent implements OnInit {
  private router = inject(Router);
  authService = inject(AuthService);

  slideIndex = 5;
  matchData: MatchData = this.authService.matchData();
  ngOnInit(): void {}
}
