import { O24ControlType } from './../kd/kd.component';
import { effect, inject, Injectable } from '@angular/core';
import { IEditorData } from '../../interfaces/editor.interface';
import { Pallette } from '../../interfaces/config.interface';
import {
  IQuestion,
  IQuestionBank,
  MatchPosition,
  QuestionType,
} from '../../interfaces/game.interface';
import { FsService } from './fs.service';
import { DialogService } from '../../services/dialog.service';
import { EditorStatus } from './enums/editor.enum';
import { EditorMediaService } from './editor.media.service';
import { MatSelectChange } from '@angular/material/select';

@Injectable({
  providedIn: 'root',
})
export class EditorDataService {
  constructor(
    private fs: FsService,
    private dialogService: DialogService,
    private media: EditorMediaService
  ) {
    this.loadAvailableEditorDataUids();
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
  public provideNewEditorData(): IEditorData {
    const newEditorData: IEditorData = {
      uiConfig: {
        darkMode: true,
        pallette: Pallette.ROSE,
        miscImageSrcNames: {}
      },
      matchData: {
        matchName: 'Welcome to Legion',
        matchVersion: 24,
        matchPos: MatchPosition.IDLE,
        players: [
          {
            name: 'Nguyễn Văn A',
            score: 0,
            isReady: false,
          },
          {
            name: 'Trần Thị B',
            score: 0,
            isReady: false,
          },
          {
            name: 'Phạm Văn C',
            score: 0,
            isReady: false,
          },
          {
            name: 'Nguyễn Thị D',
            score: 0,
            isReady: false,
          },
        ],
      },
      questionBank: {
        kd: {
          o24Questions: {
            [O24ControlType.MULTIPLAYER]: [],
            [O24ControlType.SINGLEPLAYER]: Array(4).fill([]),
          },
        },
        vcnv: {
          questions: [],
          cnvMediaSrcName: '',
        },
        tt: {
          questions: [],
        },
        vd: {
          questions: [],
        },
        chp: {
          questions: [],
        },
      },
      uid: crypto.randomUUID(),
      dateModified: Date.now(),
    };
    return newEditorData;
  }
  /**
   *
   * @returns Creates a new instance of IQuestion with default values.
   */

  private readonly matchVersionChangeMessage = {
    title: 'Bạn có chắc không?',
    message: 'Điều này sẽ xoá toàn bộ dữ liệu của phần thi khởi động hiện tại.',
  };
  public async handleMatchVersionChange(snapshot: 23 | 24) {
    if (this.editorData) {
      if (
        await this.dialogService.openConfirmationDialog(
          this.matchVersionChangeMessage.title,
          this.matchVersionChangeMessage.message
        ) == true
      ) {
        this.editorData.questionBank.kd = {};
        if (this.editorData.matchData.matchVersion === 23) {
          this.editorData.questionBank.kd.o23Questions = Array(3).fill([]);
        } else if (this.editorData.matchData.matchVersion === 24) {
          {
            this.editorData.questionBank.kd.o24Questions = {
              [O24ControlType.MULTIPLAYER]: [],
              [O24ControlType.SINGLEPLAYER]: Array(4).fill([]),
            };
          }
        }
        this.saveCurrentEditorData();
        //TODO: Implement value change for VCNV questions.
      } else {
        this.editorData.matchData.matchVersion = snapshot;
      }
    }
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
    return JSON.parse(
      localStorage.getItem('localEditorDataUids') as string
    ) as string[];
  }

  private ioWorker: undefined | ReturnType<typeof setTimeout> = undefined;

  /**
   * Save the current editor data to local storage with debouncing.
   */
  public saveCurrentEditorData() {
    //implement debouncing
    if (this.editorData) {
      clearInterval(this.ioWorker);
      this.editorStatus = EditorStatus.WORKING;
      this.ioWorker = setTimeout(async () => {
        if (this.editorData) {
          this.editorData.dateModified = Date.now();
          await this.saveLocalEditorData(this.editorData);
        }
        else {
          this.editorStatus = EditorStatus.ERROR;
        }
        this.editorStatus = EditorStatus.SAVED;
      }, 500);
    }
  }
  /**
 *
 * @param _editorData The editor data to be saved to local storage.
 * @returns A promise that resolves when the data is saved.
 */
  public async saveLocalEditorData(_editorData: IEditorData) {
    this.editorStatus = EditorStatus.WORKING;
    await this.fs.writeLocalFile(new Blob([JSON.stringify(_editorData)]), `${_editorData.uid}/editor_data.json`);
    if (!this.availableEditorDataUids) {
      localStorage.setItem('localEditorDataUids', JSON.stringify([]));
    }
    if (!this.availableEditorDataUids.includes(_editorData.uid)) {
      this.availableEditorDataUids.push(_editorData.uid);
      localStorage.setItem('localEditorDataUids', JSON.stringify(this.availableEditorDataUids));
    }
    this.editorStatus = EditorStatus.SAVED;
  }
  /**
   *
   * @param uid The uid of the editor data to be loaded.
   * @returns The editor data.
   */
  public async loadLocalEditorData(uid: string) {
    const editorData: IEditorData = JSON.parse(
      await (await this.fs.getFile(`${uid}/editor_data.json`)).text()
    ) as IEditorData;
    return this.resolveMediaSrcs(editorData);
  }
  public async resolveMediaSrcs(editorData: IEditorData) {
    editorData.questionBank = await this.media.resolveQuestionBankMediaSrc(
      editorData.questionBank,
      editorData.uid,
      editorData.matchData.matchVersion
    );
    editorData.uiConfig.miscImageSrc = await this.media.resolveMiscMediaSrc(
      editorData.uid,
      editorData.uiConfig.miscImageSrcNames);
    return editorData;
  }
  /**
   *
   * @param uid The uid of the editor data to be deleted.
   * @returns A promise that resolves when the data is deleted.
   */
  public async deleteLocalEditorData(uid: string) {
    const editorData = await this.loadLocalEditorData(uid);
    if (
      await this.dialogService.openConfirmationDialog(
        'Xoá trận đấu?',
        `Bạn có muốn xoá trận đấu ${editorData.matchData.matchName} không?`
      )
    ) {
      await this.fs.deleteDirectory(uid);
      const uids = JSON.parse(
        localStorage.getItem('localEditorDataUids') as string
      ) as string[];
      localStorage.setItem(
        'localEditorDataUids',
        JSON.stringify(uids.filter((id: string) => id !== uid))
      );
    }
  }

}
