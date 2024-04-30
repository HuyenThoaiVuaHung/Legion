import { Injectable } from '@angular/core';
import {
  IQuestion,
  QuestionType,
  IQuestionBank,
} from '../../interfaces/game.interface';
import { FsService } from './fs.service';

@Injectable({
  providedIn: 'root',
})
export class EditorMediaService {
  constructor(public fs: FsService) {}
  private getMediaType(ext: string): QuestionType {
    if (ext === 'mp4' || ext === 'webm' || ext === 'ogg')
      return QuestionType.VIDEO;
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif')
      return QuestionType.IMAGE;
    if (ext === 'mp3' || ext === 'wav' || ext === 'ogg')
      return QuestionType.AUDIO;
    return QuestionType.TEXT;
  }
  public async handleQuestionMedia(
    question: IQuestion,
    kind: 'kd' | 'vcnv' | 'tt' | 'vd',
    media: File
  ): Promise<IQuestion> {
    const ext = media.name.split('.').pop();
    if (!ext) return question;
    const mediaType = this.getMediaType(ext);
    if (mediaType === QuestionType.TEXT) return question;
    question.mediaSrcName = crypto.randomUUID() + '.' + ext;
    this.fs.writeLocalFile(media, `${kind}/${question.mediaSrcName}`);
    return question;
  }
  /**
   *
   * @param question The question to be resolved.
   * @param kind The kind of question, possible values are 'kd', 'vcnv', 'tt', 'vd'.
   * @param dataUid The uid of the editor data.
   * @returns The question with mediaSrc resolved as blob URL.
   */
  public async resolveQuestionMediaSrc(
    question: IQuestion,
    kind: 'kd' | 'vcnv' | 'tt' | 'vd',
    dataUid: string
  ): Promise<IQuestion> {
    if (question.type !== QuestionType.TEXT) {
      question.mediaSrc = await this.fs.getBlobUrl(
        `${dataUid}/${kind}/${question.mediaSrcName}`
      );
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
  public async resolveQuestionsMediaSrc(
    questions: IQuestion[],
    kind: 'kd' | 'vcnv' | 'tt' | 'vd',
    dataUid: string
  ): Promise<IQuestion[]> {
    return Promise.all(
      questions.map(
        async (question) =>
          await this.resolveQuestionMediaSrc(question, kind, dataUid)
      )
    );
  }

  /**
   *
   * @param questionBank The question bank to be resolved.
   * @param ver Version of the matchData.
   * @param dataUid The uid of the editor data.
   * @returns The question bank with mediaSrc resolved as blob URLs.
   */
  public async resolveQuestionBankMediaSrc(
    questionBank: IQuestionBank,
    dataUid: string,
    ver?: number
  ): Promise<IQuestionBank> {
    questionBank.vcnv.questions = await this.resolveQuestionsMediaSrc(
      questionBank.vcnv.questions,
      'vcnv',
      dataUid
    );
    questionBank.tt.questions = await this.resolveQuestionsMediaSrc(
      questionBank.tt.questions,
      'tt',
      dataUid
    );
    for (let questions of questionBank.vd.questions) {
      questions = await this.resolveQuestionsMediaSrc(questions, 'vd', dataUid);
    }
    if (ver) {
      if (ver === 23) {
        if (questionBank.kd.o23Questions) {
          questionBank.kd.o23Questions = await Promise.all(
            questionBank.kd.o23Questions.map(
              async (questions) =>
                await this.resolveQuestionsMediaSrc(questions, 'kd', dataUid)
            )
          );
        } else throw new Error('Invalid question bank version');
      } else if (ver === 24) {
        if (questionBank.kd.o24Questions) {
          questionBank.kd.o24Questions.MULTIPLAYER =
            await this.resolveQuestionsMediaSrc(
              questionBank.kd.o24Questions.MULTIPLAYER,
              'kd',
              dataUid
            );
          await Promise.all(
            questionBank.kd.o24Questions.SINGLEPLAYER.map(
              async (questions) =>
                await this.resolveQuestionsMediaSrc(questions, 'kd', dataUid)
            )
          );
        } else throw new Error('Invalid question bank version');
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
  public stripQuestionBankMediaSrc(
    questionBank: IQuestionBank,
    ver?: number
  ): IQuestionBank {
    questionBank.vcnv.questions = this.stripQuestionsMediaSrc(
      questionBank.vcnv.questions
    );
    questionBank.tt.questions = this.stripQuestionsMediaSrc(
      questionBank.tt.questions
    );
    for (let questions of questionBank.vd.questions) {
      questions = this.stripQuestionsMediaSrc(questions);
    }
    if (ver) {
      if (ver === 23) {
        if (questionBank.kd.o23Questions) {
          questionBank.kd.o23Questions = questionBank.kd.o23Questions.map((questions) =>
            this.stripQuestionsMediaSrc(questions)
          );
        } else throw new Error('Invalid question bank version');
      } else if (ver === 24) {
        if (questionBank.kd.o24Questions) {
          questionBank.kd.o24Questions.MULTIPLAYER = this.stripQuestionsMediaSrc(
            questionBank.kd.o24Questions.MULTIPLAYER
          );
          questionBank.kd.o24Questions.SINGLEPLAYER.map((questions) =>
            this.stripQuestionsMediaSrc(questions)
          );
        } else throw new Error('Invalid question bank version');
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
