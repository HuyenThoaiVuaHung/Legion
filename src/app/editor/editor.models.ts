/**
 * Browser-only editor archive model. Its serialized shape intentionally stays
 * compatible with Legendary's `editorData.json` import contract, while all
 * editing state and media files remain in this browser's OPFS storage.
 */
export enum EditorQuestionType {
  Text = 0,
  Image = 1,
  Audio = 2,
  Video = 3,
}

export interface EditorQuestion {
  question: string;
  answer: string;
  type: EditorQuestionType;
  value: number;
  mediaSrcName?: string;
  secondaryMediaSrcName?: string;
}

export interface EditorPlayer {
  name: string;
  score: number;
  isReady: boolean;
}

export interface EditorDocument {
  uid: string;
  dateModified: number;
  uiConfig: {
    darkMode: boolean;
    pallette: number;
    miscImageSrcNames: Record<string, string | string[] | undefined>;
  };
  matchData: {
    matchName: string;
    matchVersion: 23 | 24;
    matchPos: number;
    players: EditorPlayer[];
  };
  questionBank: {
    kd: {
      o24Questions: {
        singleplayer: EditorQuestion[][];
        multiplayer: EditorQuestion[];
      };
      o23Questions?: EditorQuestion[][];
    };
    vcnv: {
      questions: EditorQuestion[];
      cnv: string;
      cnvMediaSrcNames: string[];
    };
    tt: { questions: EditorQuestion[] };
    vd: { questions: EditorQuestion[][] };
    chp: { questions: EditorQuestion[] };
  };
}

export interface EditorIndexEntry {
  uid: string;
  matchName: string;
  dateModified: number;
}

export type EditorRoundKind = 'kd' | 'vcnv' | 'tt' | 'vd' | 'chp' | 'misc';

export const EDITOR_MEDIA_FOLDERS: readonly EditorRoundKind[] = [
  'kd',
  'vcnv',
  'tt',
  'vd',
  'chp',
  'misc',
];

export const EDITOR_PLAYER_COUNT = 4;
export const EDITOR_VCNV_ROW_COUNT = 5;
export const EDITOR_TT_QUESTION_COUNT = 4;
