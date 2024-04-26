import { IInterfaceConfig } from "./config.interface";
import { IMatchData, IQuestionBank } from "./game.interface";


export interface IEditorData {
  uiConfig: IInterfaceConfig,
  matchData: IMatchData,
  questionBank: IQuestionBank,
  uid: string
}
