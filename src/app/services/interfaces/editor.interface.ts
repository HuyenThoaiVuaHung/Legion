import { IConfig } from "./config.interface";
import { IMatchData } from "./game.interface";
import { IQuestion } from "./question.interface";

export interface IEditorData {
  config: IConfig,
  matchData: IMatchData,
  questionBank: Array<IQuestion[] | IQuestion[][]>
}
