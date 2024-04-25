import { Injectable } from '@angular/core';
import { IEditorData } from '../../interfaces/editor.interface';
import { Pallette } from '../../interfaces/config.interface';
import { IQuestionBank, MatchPosition } from '../../interfaces/game.interface';
import { NetworkingService } from '../../services/networking.service';

@Injectable({
  providedIn: 'root'
})
export class EditorDataService {
  constructor(
    private network: NetworkingService
  ) {
    //TEMP: For now, we will just provide a new editor data.
    this.editorData = this.provideNewEditorData();
  }
  public editorData: IEditorData | undefined = undefined;
  private provideNewEditorData(): IEditorData{
    return {
      uiConfig: {
        darkMode: true,
        pallette: Pallette.ROSE,
      },
      matchData: {
        matchName: "Welcome to Legion",
        matchVersion: 23,
        matchPos: MatchPosition.IDLE,
        players: [
          {
            name: 'Nguyễn Văn A',
            score: 0,
            isReady: false
          },
          {
            name: 'Trần Thị B',
            score: 0,
            isReady: false
          },
          {
            name: 'Phạm Văn C',
            score: 0,
            isReady: false
          },
          {
            name: 'Nguyễn Thị D',
            score: 0,
            isReady: false
          }
        ]
      },
      questionBank: {} as IQuestionBank
    }
  }
  public async saveEditorData(data: IEditorData){
    this.editorData = data;
    //TODO: Implement saving to localstorage.
  }
  public async getEditorData(){
    //Future: Maybe add loading from Firebase storage.
    return this.editorData;
  }
}
