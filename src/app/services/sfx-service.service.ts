import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SfxService {

  constructor() { }
  public playSfx(sfx: string){
    let audio = new Audio();
    switch(sfx){
      case 'KD_START': audio.src = '../../assets/audio-assets/kd/StartRound.mp3'; break;
      case 'KD_60S': audio.src = '../../assets/audio-assets/kd/60Seconds.mp3'; break;
      case 'KD_90S': audio.src = '../../assets/audio-assets/kd/90Seconds.mp3'; break;
      case 'KD_CORRECT': audio.src = '../../assets/audio-assets/kd/CorrectAnswer.mp3'; break;
      case 'KD_WRONG': audio.src = '../../assets/audio-assets/kd/WrongAnswer.mp3'; break;
      case 'VCNV_START': audio.src = '../../assets/audio-assets/vcnv/StartRound.mp3'; break;
      case 'VCNV_15S': audio.src = '../../assets/audio-assets/vcnv/15Seconds.mp3'; break;
      case 'VCNV_SHOWANS': audio.src = '../../assets/audio-assets/vcnv/AnswersShowing.mp3'; break;
      case 'VCNV_CORRECT_ROW': audio.src = '../../assets/audio-assets/vcnv/CorrectRow.mp3'; break;
      case 'VCNV_WRONG_ROW': audio.src = '../../assets/audio-assets/vcnv/WrongRow.mp3'; break;
      case 'VCNV_CHOOSE_ROW': audio.src = '../../assets/audio-assets/vcnv/RowChoose.mp3'; break;
      case 'VCNV_PIC_REVEAL': audio.src = '../../assets/audio-assets/vcnv/PictureReveal.mp3'; break;
      case 'VCNV_OBSTACLE': audio.src = '../../assets/audio-assets/vcnv/ObstacleGrant.mp3'; break;
      case 'VCNV_OBSTACLE_CORRECT': audio.src = '../../assets/audio-assets/vcnv/CorrectObstacle.mp3'; break;
      case 'TT_START': audio.src = '../../assets/audio-assets/tt/StartRound.mp3'; break;
      case 'TT_10S': audio.src = '../../assets/audio-assets/tt/10Seconds.mp3'; break;
      case 'TT_20S': audio.src = '../../assets/audio-assets/tt/20Seconds.mp3'; break;
      case 'TT_30S': audio.src = '../../assets/audio-assets/tt/30Seconds.mp3'; break;
      case 'TT_40S': audio.src = '../../assets/audio-assets/tt/40Seconds.mp3'; break;
      case 'TT_SHOWANS': audio.src = '../../assets/audio-assets/tt/AnswersShowing.mp3'; break;
      case 'TT_CORRECT': audio.src = '../../assets/audio-assets/tt/Correct.mp3'; break;
      case 'TT_WRONG': audio.src = '../../assets/audio-assets/tt/Wrong.mp3'; break;
      case 'TT_QUESTION_SHOW': audio.src = '../../assets/audio-assets/tt/QuestionShowing.mp3'; break;
      case 'VD_START': audio.src = '../../assets/audio-assets/vd/StartRound.mp3'; break;
      case 'VD_5S': audio.src = '../../assets/audio-assets/vd/5Seconds.mp3'; break;
      case 'VD_15S': audio.src = '../../assets/audio-assets/vd/15Seconds.mp3'; break;
      case 'VD_20S': audio.src = '../../assets/audio-assets/vd/20Seconds.mp3'; break;
      case 'VD_CHOOSE': audio.src = '../../assets/audio-assets/vd/Choose.mp3'; break;
      case 'VD_SHOW_PICKER': audio.src = '../../assets/audio-assets/vd/ShowPicker.mp3'; break;
      case 'VD_CHOSEN': audio.src = '../../assets/audio-assets/vd/PackageChosen.mp3'; break;
      case 'VD_CORRECT': audio.src = '../../assets/audio-assets/vd/Correct.mp3'; break;
      case 'VD_WRONG': audio.src = '../../assets/audio-assets/vd/Wrong.mp3'; break;
      case 'VD_START_TURN': audio.src = '../../assets/audio-assets/vd/StartTurn.mp3'; break;
      case 'VD_NSHV': audio.src = '../../assets/audio-assets/vd/NSHV.mp3'; break;
      case 'VD_STEAL_Q': audio.src = '../../assets/audio-assets/vd/Grant.mp3'; break;
      case 'VD_END': audio.src = '../../assets/audio-assets/vd/FinishRound.mp3'; break;
    }
    audio.load();
    audio.play();
  }
}
