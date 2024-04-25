import { Injectable } from '@angular/core';
import { IMatchData, IUserInfo } from '../interfaces/game.interface';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  public matchData : IMatchData = {} as IMatchData;
  public userInfo :IUserInfo = {
    roleId: -1,
    index: -1,
    socketId: "",
  };
  constructor() { }
}
