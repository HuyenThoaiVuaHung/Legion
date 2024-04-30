import { Injectable } from '@angular/core';
import { IEditorData } from '../../interfaces/editor.interface';
import { Pallette } from '../../interfaces/config.interface';
import { IQuestion, IQuestionBank, MatchPosition, QuestionType } from '../../interfaces/game.interface';
import { FsService } from './fs.service';
import { DialogService } from '../../services/dialog.service';
import { EditorStatus } from './enums/editor.enum';
import { EditorMediaService } from './editor.media.service';

@Injectable({
  providedIn: 'root'
})
export class EditorDataService {
  constructor(
    private fs: FsService,
    private dialogService: DialogService,
    private media: EditorMediaService
  ) {
  }

  /**
   * The working editor data.
   * Default value is undefined.
   */
  public editorData: IEditorData | undefined = undefined;
  /**
   * The status of the editor.
   * Possible values are:
   * - UNLOADED: The editor is not loaded.
   * - LOADED: The editor is loaded.
   * - UNSAVED: The editor has unsaved changes.
   * - SAVED: The editor has saved changes.
   * - ERROR: The editor has an error.
   * - WORKING: The editor is working.
   * Default value is UNLOADED.
   */
  public editorStatus: EditorStatus = EditorStatus.UNLOADED;
  /**
   * The available editor data uids.
   * Default value is an empty array.
   */
  public availableEditorDataUids: string[] = [];
  /**
   *
   * @returns A new instance of IEditorData with default values.
   */
  private provideNewEditorData(): IEditorData {
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
      questionBank: {
        kd: [],
        vcnv: [],
        tt: [],
        vd: Array(4).fill([]),
        chp: []
      },
      uid: crypto.randomUUID()
    }
  }
  /**
   *
   * @returns Creates a new instance of IQuestion with default values.
   */
  public async createNewEditorDataInstance() {
    const editorData = this.provideNewEditorData();
    if (this.editorData && this.editorStatus === EditorStatus.UNSAVED) {
      if (await this.dialogService.confirmationDialog('Unsaved Changes', 'You have unsaved changes. Do you want to save them?')) {
        await this.saveLocalEditorData(this.editorData);
      }
    }
    return editorData;
  }
  /**
   * Reload available editor data uids from local storage.
   */
  public loadAvailableEditorDataUids() {
    this.availableEditorDataUids = this.getAvailableEditorDataUids();
  }
  /**
   *
   * @param data The data to be set to the editor.
   */
  public async setEditorData(data: IEditorData) {
    this.editorData = data;
    this.editorStatus = EditorStatus.UNSAVED;
    await this.saveLocalEditorData(data);
    this.editorStatus = EditorStatus.SAVED;
    //TODO: Implement saving to localstorage.
  }
  /**
   *
   * @returns The editor data.
   */
  public async getEditorData() {
    //Future: Maybe add loading from Firebase storage.
    return this.editorData;
  }
  /**
   *
   * @returns The available editor data uids from local storage.
   */
  public getAvailableEditorDataUids(): string[] {
    if (!localStorage.getItem('localEditorDataUids')) {
      return [];
    }
    return JSON.parse(localStorage.getItem('localEditorDataUids') as string) as string[];
  }
  /**
   *
   * @param editorData The editor data to be saved to local storage.
   * @returns A promise that resolves when the data is saved.
   */
  public async saveLocalEditorData(editorData: IEditorData) {
    if (!localStorage.getItem('localEditorDataUids')) {
      localStorage.setItem('localEditorDataUids', JSON.stringify([]));
    }
    const uids = JSON.parse(localStorage.getItem('localEditorDataUids') as string) as string[];
    if (!uids.includes(editorData.uid)) {
      uids.push(editorData.uid);
      localStorage.setItem('localEditorDataUids', JSON.stringify(uids));
    }
    return await this.fs.writeLocalFile(new Blob([JSON.stringify(editorData)]), `${editorData.uid}/editor_data.json`);
  }
  /**
   *
   * @param uid The uid of the editor data to be loaded.
   * @returns The editor data.
   */
  public async loadLocalEditorData(uid: string) {
    const editorData: IEditorData = JSON.parse(await (await this.fs.getFile(`${uid}/editor_data.json`)).text()) as IEditorData;
    console.log(editorData);
    editorData.questionBank = await this.media.resolveQuestionBankMediaSrc(editorData.questionBank, editorData.uid, editorData.matchData.matchVersion);
    return editorData;
  }
  /**
   *
   * @param uid The uid of the editor data to be deleted.
   * @returns A promise that resolves when the data is deleted.
   */
  public async deleteLocalEditorData(uid: string) {
    const editorData = await this.loadLocalEditorData(uid);
    if (await this.dialogService.confirmationDialog('Xoá trận đấu?', `Bạn có muốn xoá trận đấu ${editorData.matchData.matchName} không?`)) {
      await this.fs.deleteDirectory(uid);
      const uids = JSON.parse(localStorage.getItem('localEditorDataUids') as string) as string[];
      localStorage.setItem('localEditorDataUids', JSON.stringify(uids.filter((id: string) => id !== uid)));
    }
  }

}
