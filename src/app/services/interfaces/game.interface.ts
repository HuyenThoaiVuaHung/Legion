export interface IUserInfo {
  socketId: string;
  roleId: number;
  index?: number;
}

export interface IMatchData {
  matchName: string;
  matchVersion: 23 | 24;
  matchPos: MatchPosition;
  players: IPlayer[];
}

export interface IPlayer {
  name: string;
  score: number;
  isReady: boolean;
}
export enum MatchPosition {
  IDLE,
  KD,
  VCNV_QUES,
  VCNV_ANS,
  TT_QUES,
  TT_ANS,
  VD,
  CHP,
  POINTS,
}
export enum SetType {
  KD,
  VCNV,
  TT,
  VD,
  CHP,
}
