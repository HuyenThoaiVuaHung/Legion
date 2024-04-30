import { Injectable } from '@angular/core';
import { IQuestion, QuestionType, IQuestionBank } from '../../interfaces/game.interface';
import { FsService } from './fs.service';

@Injectable({
  providedIn: 'root'
})
export class EditorMediaService {

  constructor(
    public fs: FsService
  ) { }
    /**
   *
   * @param question The question to be resolved.
   * @param kind The kind of question, possible values are 'kd', 'vcnv', 'tt', 'vd'.
   * @param dataUid The uid of the editor data.
   * @returns The question with mediaSrc resolved as blob URL.
   */
    public async resolveQuestionMediaSrc(question: IQuestion, kind: 'kd' | 'vcnv' | 'tt' | 'vd', dataUid: string): Promise<IQuestion> {
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
    public async resolveQuestionsMediaSrc(questions: IQuestion[], kind: 'kd' | 'vcnv' | 'tt' | 'vd', dataUid: string): Promise<IQuestion[]> {
      return Promise.all(questions.map(async (question) => await this.resolveQuestionMediaSrc(question, kind, dataUid)));
    }

    /**
     *
     * @param questionBank The question bank to be resolved.
     * @param ver Version of the matchData.
     * @param dataUid The uid of the editor data.
     * @returns The question bank with mediaSrc resolved as blob URLs.
     */
    public async resolveQuestionBankMediaSrc(questionBank: IQuestionBank, dataUid: string, ver?: number): Promise<IQuestionBank> {
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
    public stripQuestionBankMediaSrc(questionBank: IQuestionBank, ver?: number): IQuestionBank {
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
    public stripQuestionsMediaSrc(questions: IQuestion[]): IQuestion[] {
      return questions.map((question) => this.stripQuestionMediaSrc(question));
    }

    /**
     *
     * @param question The question to be stripped of blob URL.
     * @returns The question with mediaSrc | Blob URL stripped.
     */
    public stripQuestionMediaSrc(question: IQuestion): IQuestion {
      question.mediaSrc = undefined;
      return question;
    }


}
