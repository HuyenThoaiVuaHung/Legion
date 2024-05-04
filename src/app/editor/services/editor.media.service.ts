import { Injectable } from '@angular/core';
import {
  IQuestion,
  QuestionType,
  IQuestionBank,
} from '../../interfaces/game.interface';
import { FsService } from './fs.service';
import { IMiscMedia } from '../../interfaces/config.interface';

@Injectable({
  providedIn: 'root',
})
export class EditorMediaService {
  constructor(public fs: FsService) { }
  private getMediaType(filetype: string): QuestionType {
    if (filetype.startsWith('image')) return QuestionType.IMAGE;
    if (filetype.startsWith('video')) return QuestionType.VIDEO;
    if (filetype.startsWith('audio')) return QuestionType.AUDIO;
    return QuestionType.TEXT;
  }
  public async handleQuestionMedia(
    question: IQuestion,
    media: File,
    kind: 'kd' | 'vcnv' | 'tt' | 'vd' | 'chp',
    uid: string
  ): Promise<IQuestion> {
    const ext = media.name.split('.').pop();
    question.type = this.getMediaType(media.type);
    console.log(question.type, media.type, 'type');
    if (question.type === QuestionType.TEXT) return question;
    question.mediaSrcName = crypto.randomUUID() + '.' + ext;
    await this.fs.writeLocalFile(media, `${uid}/${kind}/${question.mediaSrcName}`);
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
    questionBank.vcnv.cnvMediaSrc = await this.fs.getBlobUrl(
      `${dataUid}/vcnv/${questionBank.vcnv.cnvMediaSrcName}`
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
          console.log(questionBank.kd.o23Questions, 'resolved');
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

  public async resolveMiscMediaSrc(uid: string, mediaSrcName: IMiscMedia): Promise<IMiscMedia> {
    const mediaSrc: IMiscMedia = { ...mediaSrcName, players: [...(mediaSrcName.players || [])] };

    if (mediaSrcName['logo-long']) mediaSrc['logo-long'] = await this.fs.getBlobUrl(`${uid}/misc/${mediaSrcName['logo-long']}`);
    if (mediaSrcName['logo']) mediaSrc['logo'] = await this.fs.getBlobUrl(`${uid}/misc/${mediaSrcName['logo']}`);
    if (mediaSrcName['placeholder']) mediaSrc['placeholder'] = await this.fs.getBlobUrl(`${uid}/misc/${mediaSrcName['placeholder']}`);
    if (mediaSrcName['background']) mediaSrc['background'] = await this.fs.getBlobUrl(`${uid}/misc/${mediaSrcName['background']}`);
    if (mediaSrcName.players) {
      for (let i = 0; i < Object.keys(mediaSrcName.players).length; i++) {
        console.log(mediaSrcName.players[i], 'resolving');
        const blobUrl = await this.fs.getBlobUrl(`${uid}/misc/${mediaSrcName.players[i]}`);
        if (blobUrl && mediaSrc.players) mediaSrc.players[i] = blobUrl;
      }
    }
    console.log(mediaSrc, 'resolved');
    return mediaSrc;
  }
  /**
   *
   * @param uid The uid of the editor data.
   * @param key The key of the misc media.
   * @param media The media to be set.
   * @returns The mediaSrcName of the set media.
   */
  public async setMiscMedia(uid: string, media: File): Promise<string> {
    const mediaSrcName = crypto.randomUUID() + '.' + media.name.split('.').pop();
    await this.fs.writeLocalFile(media, `${uid}/misc/${mediaSrcName}`);
    return mediaSrcName;
  }
}
