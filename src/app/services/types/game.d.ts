export interface VcnvData {
  questions: Question[];
  playerAnswers: PlayerAnswer[];
  showResults: boolean;
  disabledPlayers: number[];
  noOfOpenRows: number;
  CNVPlayers: any[];
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



export interface TtData {
  questions:           TtQuestion[];
  playerAnswers:       PlayerAnswer[];
  showResults:         boolean;
  currentQuestion:     number;
  showAnswer:          boolean;
  timerStartTimestamp: number;
}

export interface PlayerAnswer {
  id:           number;
  answer:       string;
  timestamp:    number;
  readableTime: string;
  correct:      boolean;
}

export interface TtQuestion {
  id:              number;
  question:        string;
  answer:          string;
  type:            string;
  question_image?: string;
  answer_image?:   string;
  video_name?:     string;
}
