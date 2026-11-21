export enum O24ControlType {
  SINGLEPLAYER = 'singleplayer',
  MULTIPLAYER = 'multiplayer',
}

export enum Pallette {
  RED,
  GREEN,
  BLUE,
  YELLOW,
  CYAN,
  MAGENTA,
  ORANGE,
  CHARTREUSE,
  AZURE,
  VIOLET,
  ROSE
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
  POINTS
}

export interface IMiscMedia {
  [key: string]: string | string[] | undefined;
  'logo-long'?: string
  'logo'?: string
  'placeholder'?: string
  'background'?: string
  players?: string[]
}

export interface IInterfaceConfig {
  darkMode: boolean;
  pallette: Pallette;
  miscImageSrcNames: IMiscMedia
  miscImageSrc?: IMiscMedia
}

export interface IPlayer {
  name: string;
  score: number;
  isReady: boolean;
  picUid?: string;
}

export interface IMatchData {
  matchName: string;
  matchVersion: 23 | 24;
  matchPos: MatchPosition;
  players: IPlayer[];
}

export interface IQuestion {
  question: string;
  answer: string;
  type: QuestionType;
  value: number;
  mediaSrc?: string;
  mediaSrcName?: string;
  secondaryMediaSrc?: string;
  secondaryMediaSrcName?: string;
}

export interface IQuestionBank {
  kd: IKdQuestionData;
  vcnv: IVcnvQuestionData;
  tt: ITtQuestionData;
  vd: IVdQuestionData;
  chp: IChpQuestionData;
}

export interface IKdQuestionData {
  o24Questions?: {
    [O24ControlType.MULTIPLAYER]: IQuestion[];
    [O24ControlType.SINGLEPLAYER]: IQuestion[][];
  };
  o23Questions?: IQuestion[][];
}

export interface IVcnvQuestionData {
  questions: IQuestion[];
  cnvMediaSrcs?: string[];
  cnv: string;
  cnvMediaSrcNames: string[];
}

export interface ITtQuestionData {
  questions: IQuestion[];
}
export interface IVdQuestionData {
  questions: IQuestion[][];
}
export interface IChpQuestionData {
  questions: IQuestion[];
}

export interface IEditorData {
  uiConfig: IInterfaceConfig;
  matchData: IMatchData;
  questionBank: IQuestionBank;
  uid: string;
  dateModified: number;
}
