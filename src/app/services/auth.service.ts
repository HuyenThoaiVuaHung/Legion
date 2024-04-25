import { Injectable } from '@angular/core';
import { NetworkingService } from './networking.service';
import { IMatchData, MatchPosition, IUserInfo } from '../interfaces/game.interface';
import { Route, Router } from '@angular/router';
import { SharedDataService } from './shared.data.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public socketHook = () => { };
  constructor(
    private router: Router,
    private network: NetworkingService,
    private sharedData: SharedDataService
  ) {
    console.log(localStorage.getItem('authString') && router.url != '/connect');
    if (localStorage.getItem('authString') && router.url != '/connect')
      this.authenticate();
    else;
    this.resetListeners();
  }
  public authenticate(authId?: string) {
    this.network.socket.emit(
      'init-authenticate',
      authId ? authId : localStorage.getItem('authString'),
      (callback: string) => console.log(callback)
    );
  }
  public resetListeners() {
    this.network.socket.removeAllListeners();
    this.network.socket.on('connect', () => {
      if (localStorage.getItem('authString')) this.authenticate();
    });
    this.network.socket.on(
      'authentication',
      (_matchData: IMatchData, _userInfo: IUserInfo) => {
        this.sharedData.matchData = _matchData;
        this.sharedData.userInfo = _userInfo;
        this.socketHook();
        if (_userInfo.roleId == 1) return;
        console.log();
        this.navigateMatchPosition();
      }
    );
    this.network.socket.on('update-match-data', (data) => {
      this.sharedData.matchData = data;
      if (this.sharedData.userInfo.roleId == 1) return;
      this.navigateMatchPosition();
    });
  }
  public deauthenticate() {
    localStorage.removeItem('authString');
    this.socketHook = () => { };

    this.sharedData.userInfo = {
      roleId: -1,
      index: -1,
      socketId: '',
    };
    this.reconnect();
  }
  public reconnect() {
    this.network.socket.disconnect();
    this.network.socket.connect();
    this.resetListeners();
  }
  private navigateMatchPosition() {
    if (
      this.sharedData.userInfo.roleId == 1 ||
      this.sharedData.userInfo.roleId == 2
    )
      return;
    const matchPos = MatchPosition;
    console.log(this.sharedData.matchData.matchPos + 'nav');
    switch (this.sharedData.matchData.matchPos) {
      case matchPos.KD:
        this.router.navigate(['/player/kd']);
        break;
      case matchPos.VCNV_QUES:
        this.router.navigate(['/player/vcnv-q']);
        break;
      case matchPos.VCNV_ANS:
        this.router.navigate(['/player/vcnv-a']);
        break;
      case matchPos.TT_QUES:
        this.router.navigate(['/player/tangtoc-q']);
        break;
      case matchPos.TT_ANS:
        this.router.navigate(['/player/tangtoc-a']);
        break;
      case matchPos.VD:
        this.router.navigate(['player/vd']);
        break;
      case matchPos.IDLE:
        this.router.navigate(['']);
        break;
      case matchPos.POINTS:
        this.router.navigate(['/pnts']);
        break;
      case matchPos.CHP:
        this.router.navigate(['/player/chp']);
    }
  }
}
