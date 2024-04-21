import { SetType } from "./game.interface";

export interface IQuestion {
  question: string,
  answer: string,
  type: QuestionType,
  ofSet: SetType,
  questionValue: number,
  mediaSrc?: string,
}
export enum QuestionType {
  TEXT,
  IMAGE,
  AUDIO,
  VIDEO
}
