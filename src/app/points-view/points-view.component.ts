import { AuthService } from"../services/auth.service";
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { MatchData } from '../services/types/match.data';

@Component({
  selector: 'app-points-view',
  templateUrl: './points-view.component.html',
  styleUrls: ['./points-view.component.scss']
})
export class PointsViewComponent implements OnInit {
  slideIndex = 5;
  matchData: MatchData= this.authService.matchData();
  constructor(
    private router: Router,
    public authService: AuthService
  ) { }
  ngOnInit(): void {

  }
}
