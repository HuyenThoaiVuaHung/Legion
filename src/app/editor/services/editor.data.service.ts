import { Injectable } from '@angular/core';
import { IEditorData } from '../../interfaces/editor.interface';
import { Pallette } from '../../interfaces/config.interface';
import { IQuestion, IQuestionBank, MatchPosition, QuestionType } from '../../interfaces/game.interface';
import { NetworkingService } from '../../services/networking.service';
import { FsService } from './fs.service';
import { DialogService } from '../../services/dialog.service';
import { EditorStatus } from './enums/editor.enum';

@Injectable({
  providedIn: 'root'
})
export class EditorDataService {
  constructor(
    private fs: FsService,
    private dialogService: DialogService
  ) {
    //TEMP: For now, we will just provide a new editor data.
    this.editorData = this.provideNewEditorData();
  }
  public editorData: IEditorData | undefined = undefined;
  public editorStatus: EditorStatus = EditorStatus.UNLOADED;
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
      questionBank: {} as IQuestionBank,
      uid: crypto.randomUUID()
    }
  }
  public async createNewEditorDataInstance() {
    const editorData = this.provideNewEditorData();
    if (this.editorData) {
      if (await this.dialogService.confirmationDialog('Unsaved Changes', 'You have unsaved changes. Do you want to save them?')) {
        await this.saveEditorData(this.editorData);
      }
    }
    this.editorData = editorData;
    return;
  }
  public async setEditorData(data: IEditorData) {
    this.editorData = data;
    //TODO: Implement saving to localstorage.
  }
  public async getEditorData() {
    //Future: Maybe add loading from Firebase storage.
    return this.editorData;
  }
  public getAvailableEditorDataUids(): string[] {
    if (!localStorage.getItem('localEditorDataUids')) {
      return [];
    }
    return JSON.parse(localStorage.getItem('localEditorDataUids') as string) as string[];
  }
  public async saveEditorData(editorData: IEditorData) {
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
  public async loadLocalEditorData(uid: string) {
    const editorData: IEditorData = JSON.parse(await (await this.fs.getFile(`${uid}/editor_data.json`)).text()) as IEditorData;
    editorData.questionBank = await this.resolveQuestionBankMediaSrc(editorData.questionBank, editorData.uid, editorData.matchData.matchVersion);
    return editorData;
  }

  /**
   *
   * @param question The question to be resolved.
   * @param kind The kind of question, possible values are 'kd', 'vcnv', 'tt', 'vd'.
   * @param dataUid The uid of the editor data.
   * @returns The question with mediaSrc resolved as blob URL.
   */
  private async resolveQuestionMediaSrc(question: IQuestion, kind: 'kd' | 'vcnv' | 'tt' | 'vd', dataUid: string): Promise<IQuestion> {
    if (question.type !== QuestionType.TEXT) {
      question.mediaSrc = await this.fs.getBlobUrl(`${dataUid}/${kind}/${question.mediaSrcName}`);
    }
    return question;
  }

  /**
   *
   * @param questions The questions to be resolved.
   * @param kind The kind of questions, possible values are 'kd', 'vcnv', 'tt', 'vd'.
   * @param dataUid The uid of the editor data.
   * @returns The questions with mediaSrc resolved as blob URLs.
   */
  private async resolveQuestionsMediaSrc(questions: IQuestion[], kind: 'kd' | 'vcnv' | 'tt' | 'vd', dataUid: string): Promise<IQuestion[]> {
    return Promise.all(questions.map(async (question) => await this.resolveQuestionMediaSrc(question, kind, dataUid)));
  }

  /**
   *
   * @param questionBank The question bank to be resolved.
   * @param ver Version of the matchData.
   * @param dataUid The uid of the editor data.
   * @returns The question bank with mediaSrc resolved as blob URLs.
   */
  private async resolveQuestionBankMediaSrc(questionBank: IQuestionBank, dataUid: string, ver?: number): Promise<IQuestionBank> {
    questionBank.vcnv = await this.resolveQuestionsMediaSrc(questionBank.vcnv, 'vcnv', dataUid);
    questionBank.tt = await this.resolveQuestionsMediaSrc(questionBank.tt, 'tt', dataUid);
    for (let questions of questionBank.vd) {
      questions = await this.resolveQuestionsMediaSrc(questions, 'vd', dataUid);
    }
    if (ver) {
      if (ver === 23) {
        if (Array.isArray(questionBank.kd)) {
          questionBank.kd = await Promise.all(questionBank.kd.map(async (questions) => await this.resolveQuestionsMediaSrc(questions, 'kd', dataUid)));
        }
        else throw new Error('Invalid question bank version');
      }
      else if (ver === 24) {
        if (!Array.isArray(questionBank.kd)) {
          questionBank.kd.MULTIPLAYER = await this.resolveQuestionsMediaSrc(questionBank.kd.MULTIPLAYER, 'kd', dataUid);
          await Promise.all(questionBank.kd.SINGLEPLAYER.map(async (questions) => await this.resolveQuestionsMediaSrc(questions, 'kd', dataUid)));
        }
        else throw new Error('Invalid question bank version');
      }
    }
    return questionBank;
  }

  /**
   *
   * @param questionBank The question bank to be stripped of blob URLs.
   * @param ver Version of the matchData.
   * @returns The question bank with mediaSrc | Blob URLs stripped.
   */
  private stripQuestionBankMediaSrc(questionBank: IQuestionBank, ver?: number): IQuestionBank {
    questionBank.vcnv = this.stripQuestionsMediaSrc(questionBank.vcnv);
    questionBank.tt = this.stripQuestionsMediaSrc(questionBank.tt);
    for (let questions of questionBank.vd) {
      questions = this.stripQuestionsMediaSrc(questions);
    }
    if (ver) {
      if (ver === 23) {
        if (Array.isArray(questionBank.kd)) {
          questionBank.kd = questionBank.kd.map((questions) => this.stripQuestionsMediaSrc(questions));
        }
        else throw new Error('Invalid question bank version');
      }
      else if (ver === 24) {
        if (!Array.isArray(questionBank.kd)) {
          questionBank.kd.MULTIPLAYER = this.stripQuestionsMediaSrc(questionBank.kd.MULTIPLAYER);
          questionBank.kd.SINGLEPLAYER.map((questions) => this.stripQuestionsMediaSrc(questions));
        }
        else throw new Error('Invalid question bank version');
      }
    }
    return questionBank;
  }

  /**
   *
   * @param questions The questions to be stripped of blob URLs.
   * @returns The questions with mediaSrc | Blob URLs stripped.
   */
  private stripQuestionsMediaSrc(questions: IQuestion[]): IQuestion[] {
    return questions.map((question) => this.stripQuestionMediaSrc(question));
  }

  /**
   *
   * @param question The question to be stripped of blob URL.
   * @returns The question with mediaSrc | Blob URL stripped.
   */
  private stripQuestionMediaSrc(question: IQuestion): IQuestion {
    question.mediaSrc = undefined;
    return question;
  }

}
