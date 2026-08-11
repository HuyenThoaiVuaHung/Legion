import {
  ChpQuestion,
  KdQuestion,
  RoundKind,
  TtQuestion,
  VcnvQuestion,
  VdQuestion,
} from '../../core/contracts/game';

export type AnyQuestion = KdQuestion | VcnvQuestion | TtQuestion | VdQuestion | ChpQuestion;

export type PreviewMedia = 'none' | 'image' | 'audio' | 'video';

/** Uniform view of one question row for the dashboard preview table. */
export interface QuestionPreview {
  question: string;
  answer: string;
  typeLabel: string;
  media: PreviewMedia;
  /** File names to feed MediaService.resolve(kind, …). */
  imageFile?: string;
  secondaryImageFile?: string;
  audioFile?: string;
  videoFile?: string;
}

/** Normalizes any canonical question shape into a QuestionPreview. */
export function toQuestionPreview(kind: RoundKind, question: AnyQuestion): QuestionPreview {
  const base = { question: question.question, answer: question.answer };

  switch (kind) {
    case 'kd': {
      const q = question as KdQuestion;
      if (q.type === 'P') {
        return { ...base, typeLabel: q.type, media: 'image', imageFile: q.mediaFile };
      }
      if (q.type === 'A') {
        return { ...base, typeLabel: q.type, media: 'audio', audioFile: q.mediaFile };
      }
      return { ...base, typeLabel: q.type, media: 'none' };
    }
    case 'vcnv': {
      const q = question as VcnvQuestion;
      if (q.type === 'CNV') {
        return { ...base, typeLabel: q.type, media: 'image', imageFile: q.imageFile };
      }
      if (q.type === 'HN_S') {
        return { ...base, typeLabel: q.type, media: 'audio', audioFile: q.audioFile };
      }
      return { ...base, typeLabel: q.type, media: 'none' };
    }
    case 'tt': {
      const q = question as TtQuestion;
      if (q.type === 'video') {
        return { ...base, typeLabel: q.type, media: 'video', videoFile: q.videoFile };
      }
      return {
        ...base,
        typeLabel: q.type,
        media: 'image',
        imageFile: q.questionImage,
        secondaryImageFile: q.answerImage,
      };
    }
    case 'vd': {
      const q = question as VdQuestion;
      if (q.type === 'I') {
        return { ...base, typeLabel: q.type, media: 'image', imageFile: q.mediaFile };
      }
      if (q.type === 'A') {
        return { ...base, typeLabel: q.type, media: 'audio', audioFile: q.mediaFile };
      }
      if (q.type === 'V') {
        return { ...base, typeLabel: q.type, media: 'video', videoFile: q.mediaFile };
      }
      return { ...base, typeLabel: q.type, media: 'none' };
    }
    case 'chp':
      return { ...base, typeLabel: 'N', media: 'none' };
  }
}
