export interface VcnvData {
  questions: Question[];
  playerAnswers: PlayerAnswer[];
  showResults: boolean;
  disabledPlayers: number[];
  noOfOpenRows: number;
  CNVPlayers: number[];
}

export interface PlayerAnswer {
  answer: string;
  correct: boolean;
}

export interface Question {
  id: number;
  type: string;
  value: number;
  ifOpen: boolean;
  ifShown: boolean;
  question: string;
  answer: string;
  audioFilePath?: string;
  picFileName?: string;
}

export interface KdData {
  questions: KdQuestions;
  gamemode: string;
  currentSingleplayerPlayer: number;
}

export interface KdQuestions {
  singleplayer: Array<KdQuestion[]>;
  multiplayer: KdQuestion[];
}

export interface KdQuestion {
  question: string;
  answer: string;
  type: Type;
}

export enum Type {
  N = "N",
  P = "P",
  A = "A",
}
