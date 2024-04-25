import { O24ControlType } from "../editor/kd/kd.component";

export interface IUserInfo {
  sessionId: string;
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
  picUid?: string;
}

export interface IQuestionBank {
  kd: IQuestion[][] | O24KdQuestionData,
  vcnv: IQuestion[],
  tt: IQuestion[],
  vd: IQuestion[][],
  chp: IQuestion[]

}
export interface O24KdQuestionData {
  [O24ControlType.SINGLEPLAYER]: IQuestion[][],
  [O24ControlType.MULTIPLAYER]: IQuestion[]
}
export interface IQuestion {
  question: string,
  answer: string,
  type: QuestionType,
  questionValue: number,
  mediaSrc?: string,
}

export enum QuestionType {
  TEXT,
  IMAGE,
  AUDIO,
  VIDEO
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

