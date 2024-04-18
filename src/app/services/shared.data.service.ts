import { Injectable } from '@angular/core';
import { MatchData, UserInfo } from './interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  public matchData : MatchData = {} as MatchData;
  public userInfo :UserInfo = {
    roleId: -1,
    index: -1,
    socketId: "",
  };
  constructor() { }
}
