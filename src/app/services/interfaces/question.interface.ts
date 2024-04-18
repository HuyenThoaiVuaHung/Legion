export interface QuestionInterface {
  question: string,
  answer: string,
  type: QuestionType,
  questionValue: number
}
export enum QuestionType {
  TEXT,
  IMAGE,
  AUDIO
}
