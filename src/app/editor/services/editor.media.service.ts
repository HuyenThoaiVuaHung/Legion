import { Injectable } from '@angular/core';
import {
  IQuestionBank,
} from '../../interfaces/editor.data.interface';
import { IQuestion } from '../../interfaces/game.interface';
import { QuestionType } from '../../interfaces/game.interface';
import { FsService } from './fs.service';
import { IMiscMedia } from '../../interfaces/config.interface';

@Injectable({
  providedIn: 'root',
})
export class EditorMediaService {
  constructor(public fs: FsService) { }
  public getMediaType(filetype: string): QuestionType {
    if (filetype.startsWith('image')) return QuestionType.IMAGE;
    if (filetype.startsWith('video')) return QuestionType.VIDEO;
    if (filetype.startsWith('audio')) return QuestionType.AUDIO;
    return QuestionType.TEXT;
  }
  public async handleQuestionMedia(
    question: IQuestion,
    media: File,
    kind: 'kd' | 'vcnv' | 'tt' | 'vd' | 'chp',
    uid: string,
    isSecondary: boolean = false
  ): Promise<IQuestion> {
    const ext = media.name.split('.').pop();
    question.type = this.getMediaType(media.type);
    console.log(question.type, media.type, 'type');
    if (question.type === QuestionType.TEXT) return question;
    if (!isSecondary) question.mediaSrcName = await this.setMedia(uid, media, kind);
    else question.secondaryMediaSrcName = await this.setMedia(uid, media, kind);
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
    kind: 'kd' | 'vcnv' | 'tt' | 'vd' | 'chp',
    dataUid: string,
    blobHandler?: questionMediaFileHandler
  ): Promise<IQuestion> {
    if (question.type !== QuestionType.TEXT) {
      if (question.mediaSrcName !== undefined && question.mediaSrcName !== '') {
        question.mediaSrc = await this.fs.getBlobUrl(
          `${dataUid}/${kind}/${question.mediaSrcName}`
        );
        if (blobHandler) {
          await blobHandler(await this.fs.getFile(`${dataUid}/${kind}/${question.mediaSrcName}`), kind);
        }
      }
      else question.mediaSrc = undefined;
      if (question.secondaryMediaSrcName) {
        question.secondaryMediaSrc = await this.fs.getBlobUrl(
          `${dataUid}/${kind}/${question.secondaryMediaSrcName}`
        );
        if (blobHandler) {
          blobHandler(await this.fs.getFile(`${dataUid}/${kind}/${question.secondaryMediaSrcName}`), kind);
        }
      }
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
    kind: 'kd' | 'vcnv' | 'tt' | 'vd' | 'chp',
    dataUid: string,
    blobHandler?: questionMediaFileHandler
  ): Promise<IQuestion[]> {
    return Promise.all(
      questions.map(
        async (question) =>
          await this.resolveQuestionMediaSrc(question, kind, dataUid, blobHandler)
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
    ver?: number,
    blobHandler?: questionMediaFileHandler
  ): Promise<IQuestionBank> {

    questionBank.vcnv.questions = await this.resolveQuestionsMediaSrc(
      questionBank.vcnv.questions,
      'vcnv',
      dataUid, blobHandler
    );
    questionBank.vcnv.cnvMediaSrcs = [];
    for (let src of questionBank.vcnv.cnvMediaSrcNames) {
      questionBank.vcnv.cnvMediaSrcs.push(
        (await this.fs.getBlobUrl(`${dataUid}/vcnv/${src}`)) || ''
      );
      if (blobHandler && src !== '') {
        await blobHandler(await this.fs.getFile(`${dataUid}/vcnv/${src}`), 'vcnv');
      }
    }

    questionBank.tt.questions = await this.resolveQuestionsMediaSrc(
      questionBank.tt.questions,
      'tt',
      dataUid, blobHandler
    );

    for (let questions of questionBank.vd.questions) {
      questions = await this.resolveQuestionsMediaSrc(questions, 'vd', dataUid, blobHandler);
    }

    questionBank.chp.questions = await this.resolveQuestionsMediaSrc(questionBank.chp.questions, 'chp', dataUid, blobHandler)
    if (ver) {
      if (ver === 23) {
        if (questionBank.kd.o23Questions) {
          questionBank.kd.o23Questions = await Promise.all(
            questionBank.kd.o23Questions.map(
              async (questions) =>
                await this.resolveQuestionsMediaSrc(questions, 'kd', dataUid, blobHandler)
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
              dataUid, blobHandler
            );
          await Promise.all(
            questionBank.kd.o24Questions.SINGLEPLAYER.map(
              async (questions) =>
                await this.resolveQuestionsMediaSrc(questions, 'kd', dataUid, blobHandler)
            )
          );
        } else throw new Error('Invalid question bank version');
      }
    }
    return questionBank;
  }
  public async handleCnvMedia(file: File, uid: string): Promise<string[]> {
    const mediaSrcNames: string[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.setAttribute('crossorigin', 'anonymous');
    const width = (canvas.width = 1920);
    const height = (canvas.height = 1080);
    const canvasImgBlob = async () => {
      return await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!));
      });
    };
    // First corner
    await this.wait(500);
    ctx.drawImage(img, 0, 0, width, height);
    ctx.clearRect(width / 4, height / 4, (width * 3) / 4, (height * 3) / 4);
    ctx.clearRect(0, height / 2, (width * 3) / 4, (height * 3) / 4);
    ctx.clearRect(width / 2, 0, (width * 3) / 4, (height * 3) / 4);
    mediaSrcNames.push(
      await this.setMedia(
        uid,
        new File([await canvasImgBlob()], crypto.randomUUID() + '.png'),
        'vcnv'
      )
    );
    // Second corner
    ctx.drawImage(img, 0, 0, width, height);
    ctx.clearRect(0, height / 4, (width * 3) / 4, (height * 3) / 4);
    ctx.clearRect(0, 0, (width * 2) / 4, (height * 3) / 4);
    ctx.clearRect((width * 3) / 4, height / 2, width, (height * 3) / 4);
    mediaSrcNames.push(
      await this.setMedia(
        uid,
        new File([await canvasImgBlob()], crypto.randomUUID() + '.png'),
        'vcnv'
      )
    );
    ctx.drawImage(img, 0, 0, width, height);

    // Third corner
    ctx.clearRect(0, 0, (width * 3) / 4, (height * 3) / 4);
    ctx.clearRect(0, (height * 3) / 4, (width * 2) / 4, (height * 3) / 4);
    ctx.clearRect((width * 3) / 4, 0, width / 4, (height * 1) / 2);
    mediaSrcNames.push(
      await this.setMedia(
        uid,
        new File([await canvasImgBlob()], crypto.randomUUID() + '.png'),
        'vcnv'
      )
    );
    ctx.drawImage(img, 0, 0, width, height);

    // Fourth corner
    ctx.clearRect(width / 4, 0, (width * 3) / 4, (height * 3) / 4);
    ctx.clearRect(0, 0, width / 4, height / 2);
    ctx.clearRect(width / 2, (height * 3) / 4, width / 2, height / 4);
    mediaSrcNames.push(
      await this.setMedia(
        uid,
        new File([await canvasImgBlob()], crypto.randomUUID() + '.png'),
        'vcnv'
      )
    );

    ctx.drawImage(img, 0, 0, width, height);

    // Middle piece
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.rect((width * 1) / 4, (height * 1) / 4, width / 2, height / 2);
    ctx.clip();
    ctx.drawImage(img, 0, 0, width, height);
    mediaSrcNames.push(
      await this.setMedia(
        uid,
        new File([await canvasImgBlob()], crypto.randomUUID + '.png'),
        'vcnv'
      )
    );

    return mediaSrcNames;
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
          questionBank.kd.o23Questions = questionBank.kd.o23Questions.map(
            (questions) => this.stripQuestionsMediaSrc(questions)
          );
        } else throw new Error('Invalid question bank version');
      } else if (ver === 24) {
        if (questionBank.kd.o24Questions) {
          questionBank.kd.o24Questions.MULTIPLAYER =
            this.stripQuestionsMediaSrc(
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
  async wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

  public async resolveMiscMediaSrc(uid: string, mediaSrcName: IMiscMedia,
    fileHandler?: questionMediaFileHandler
  ): Promise<IMiscMedia> {
    const mediaSrc: IMiscMedia = {
      ...mediaSrcName,
      players: [],
    };

    const properties = ['logo-long', 'logo', 'placeholder', 'background'];

    for (const property of properties) {
      if (mediaSrcName[property]) {
        if (fileHandler) {
          fileHandler(
            await this.fs.getFile(`${uid}/misc/${mediaSrcName[property]}`),
            'misc'
          );
        }
        mediaSrc[property] = await this.fs.getBlobUrl(`${uid}/misc/${mediaSrcName[property]}`);
      }
    }

    if (mediaSrcName.players) {
      for (let name of mediaSrcName.players) {
        if (name != '') {
          if (fileHandler) {
            fileHandler(
              await this.fs.getFile(`${uid}/misc/${name}`),
              'misc'
            );
          }

          mediaSrc.players!.push(await this.fs.getBlobUrl(`${uid}/misc/${name}`) || '');
        }
      }
    }

    return mediaSrc;
  }
  /**
   *
   * @param uid The uid of the editor data.
   * @param media The media to be set.
   * @returns The mediaSrcName of the set media.
   */
  public async setMedia(
    uid: string,
    media: File,
    kind: 'kd' | 'vcnv' | 'tt' | 'vd' | 'chp' | 'misc'
  ): Promise<string> {
    const mediaSrcName =
      crypto.randomUUID() + '.' + media.name.split('.').pop();
    await this.fs.writeLocalFile(media, `${uid}/${kind}/${mediaSrcName}`);
    return mediaSrcName;
  }
}
type questionMediaFileHandler = (blob: File, kind: string) => Promise<void>;
