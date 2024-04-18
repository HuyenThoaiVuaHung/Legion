import { Injectable } from '@angular/core';
import { NetworkingService } from './networking.service';
import { MatchData, UserInfo } from './interfaces/user.interface';
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
      (_matchData: MatchData, _userInfo: UserInfo) => {
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
    console.log(this.sharedData.matchData.matchPos + 'nav');
    switch (this.sharedData.matchData.matchPos) {
      case 'KD':
        this.router.navigate(['/player/kd']);
        break;
      case 'VCNV_Q':
        this.router.navigate(['/player/vcnv-q']);
        break;
      case 'VCNV_A':
        this.router.navigate(['/player/vcnv-a']);
        break;
      case 'TT_Q':
        this.router.navigate(['/player/tangtoc-q']);
        break;
      case 'TT_A':
        this.router.navigate(['/player/tangtoc-a']);
        break;
      case 'VD':
        this.router.navigate(['player/vd']);
        break;
      case 'H':
        this.router.navigate(['']);
        break;
      case 'PNTS':
        this.router.navigate(['/pnts']);
        break;
      case 'CHP':
        this.router.navigate(['/player/chp']);
    }
  }
}
