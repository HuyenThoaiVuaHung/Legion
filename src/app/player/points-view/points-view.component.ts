import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { MatchData } from "src/app/services/types/match.data";

@Component({
  selector: "app-points-view",
  templateUrl: "./points-view.component.html",
  styleUrls: ["./points-view.component.scss"],
})
export class PointsViewComponent implements OnInit {
  slideIndex = 5;
  matchData: MatchData = this.authService.matchData();
  constructor(private router: Router, public authService: AuthService) {}
  ngOnInit(): void {}
}
