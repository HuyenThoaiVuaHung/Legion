import { O24ControlType } from '../editor/kd/kd.component';

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
  kd: KdQuestionsData;
  vcnv: VcnvQuestionsData;
  tt: TtQuestionData;
  vd: VdQuestionsData;
  chp: ChpQuestionsData;
}

export interface KdQuestionsData {
  o24Questions?: {
    [O24ControlType.MULTIPLAYER]: IQuestion[];
    [O24ControlType.SINGLEPLAYER]: IQuestion[][];
  };
  o23Questions?: IQuestion[][];
}

export interface VcnvQuestionsData {
  questions: IQuestion[];
}

export interface TtQuestionData {
  questions: IQuestion[];
}
export interface VdQuestionsData {
  questions: IQuestion[][];
}
export interface ChpQuestionsData {
  questions: IQuestion[];
}
export interface IQuestion {
  question: string;
  answer: string;
  type: QuestionType;
  value: number;
  mediaSrc?: string;
  mediaSrcName?: string;
}

export enum QuestionType {
  TEXT,
  IMAGE,
  AUDIO,
  VIDEO,
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
