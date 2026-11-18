import { Injectable } from '@angular/core';

/**
 * Sound-effect codes are part of the socket protocol ('play-sfx' payloads).
 * This table is the single mapping from code to bundled asset — extracted
 * verbatim from the legacy switch statement.
 */
const SFX_FILES: Readonly<Record<string, string>> = {
  KD_START: 'assets/audio-assets/kd/StartRound.mp3',
  KD_60S: 'assets/audio-assets/kd/60Seconds.mp3',
  KD_90S: 'assets/audio-assets/kd/90Seconds.mp3',
  BLANK_SPC: 'assets/audio-assets/others/Space.mp3',
  KD_GET_TURN: 'assets/audio-assets/kd/GetTurn.mp3',
  KD_CORRECT: 'assets/audio-assets/kd/CorrectAnswer.mp3',
  KD_WRONG: 'assets/audio-assets/kd/WrongAnswer.mp3',
  VCNV_START: 'assets/audio-assets/vcnv/StartRound.mp3',
  VCNV_15S: 'assets/audio-assets/vcnv/15Seconds.mp3',
  VCNV_SHOWANS: 'assets/audio-assets/vcnv/AnswersShowing.mp3',
  VCNV_CORRECT_ROW: 'assets/audio-assets/vcnv/CorrectRow.mp3',
  VCNV_WRONG_ROW: 'assets/audio-assets/vcnv/WrongRow.mp3',
  VCNV_CHOOSE_ROW: 'assets/audio-assets/vcnv/RowChoose.mp3',
  VCNV_PIC_REVEAL: 'assets/audio-assets/vcnv/PictureReveal.mp3',
  VCNV_OBSTACLE: 'assets/audio-assets/vcnv/ObstacleGrant.mp3',
  VCNV_OBSTACLE_CORRECT: 'assets/audio-assets/vcnv/CorrectObstacle.mp3',
  TT_START: 'assets/audio-assets/tt/StartRound.mp3',
  TT_10S: 'assets/audio-assets/tt/10Seconds.mp3',
  TT_20S: 'assets/audio-assets/tt/20Seconds.mp3',
  TT_30S: 'assets/audio-assets/tt/30Seconds.mp3',
  TT_40S: 'assets/audio-assets/tt/40Seconds.mp3',
  TT_SHOWANS: 'assets/audio-assets/tt/AnswersShowing.mp3',
  TT_CORRECT: 'assets/audio-assets/tt/Correct.mp3',
  TT_WRONG: 'assets/audio-assets/tt/Wrong.mp3',
  TT_QUESTION_SHOW: 'assets/audio-assets/tt/QuestionShowing.mp3',
  VD_START: 'assets/audio-assets/vd/StartRound.mp3',
  VD_5S: 'assets/audio-assets/vd/5Seconds.mp3',
  VD_15S: 'assets/audio-assets/vd/15Seconds.mp3',
  VD_20S: 'assets/audio-assets/vd/20Seconds.mp3',
  VD_CHOOSE: 'assets/audio-assets/vd/Choose.mp3',
  VD_SHOW_PICKER: 'assets/audio-assets/vd/ShowPicker.mp3',
  VD_CHOSEN: 'assets/audio-assets/vd/PackageChosen.mp3',
  VD_CORRECT: 'assets/audio-assets/vd/Correct.mp3',
  VD_WRONG: 'assets/audio-assets/vd/Wrong.mp3',
  VD_START_TURN: 'assets/audio-assets/vd/StartTurn.mp3',
  VD_NSHV: 'assets/audio-assets/vd/NSHV.mp3',
  VD_STEAL_Q: 'assets/audio-assets/vd/Grant.mp3',
  VD_END: 'assets/audio-assets/vd/FinishRound.mp3',
};

@Injectable({ providedIn: 'root' })
export class SfxService {
  private loopingAudio: HTMLAudioElement | null = null;

  play(code: string, loop = false): void {
    const file = SFX_FILES[code];
    if (!file) return;
    const audio = new Audio(file);
    audio.loop = loop;
    if (loop) this.loopingAudio = audio;
    void audio.play();
  }

  stopLoop(): void {
    this.loopingAudio?.pause();
    this.loopingAudio = null;
  }
}
