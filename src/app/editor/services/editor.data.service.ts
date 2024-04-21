import { Injectable } from '@angular/core';
import { IEditorData } from '../../services/interfaces/editor.interface';
import { Pallette } from '../../services/interfaces/config.interface';
import { MatchPosition } from '../../services/interfaces/game.interface';
import { NetworkingService } from '../../services/networking.service';
import { IQuestion } from '../../services/interfaces/question.interface';

@Injectable({
  providedIn: 'root'
})
export class EditorDataService {
  constructor(
    private network: NetworkingService
  ) {
    this.initializeNewEditorData();
  }
  public editorData?: IEditorData;
  public initializeNewEditorData(){
    this.editorData = {
      config: {
        darkMode: true,
        pallette: Pallette.ROSE,
        useBackground: false
      },
      matchData: {
        matchName: "Welcome to Legion",
        matchVersion: 24,
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
      questionBank: Array<IQuestion[]>(5)
    }
  }

}
