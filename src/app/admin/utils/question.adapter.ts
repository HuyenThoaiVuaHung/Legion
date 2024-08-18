import {
  ChpQuestion,
  KdQuestion,
  Question,
  TtQuestion,
  VcnvQuestion,
  VdQuestion,
  Type,
} from "../../services/types/game";

export function normalizeQuestion(
  data: KdQuestion | VcnvQuestion | TtQuestion | VdQuestion | ChpQuestion | any
): Question {
  let type: Type = Type.NORMAL;
  if (!data.type) {
    type = Type.NORMAL;
  } else {
    switch (data.type) {
      case "A":
      case "HN_S":
        type = Type.AUDIO;
        break;
      case "V":
      case "TT_VD":
        type = Type.VIDEO;
        break;
      case "I":
      case "TT_IMG":
      case "P":
      case "CNV":
        type = Type.IMAGE;
        type = Type.IMAGE;
        break;
      case "N":
      case "HN":
      default:
        type = Type.NORMAL;
        break;
    }
  }
  let image_name: any;
  let secondary_image_name: any;
  let audio_name: any;
  let video_name: any;

  if (type === Type.AUDIO) {
    if (data.type === "HN_S") audio_name = data.audioFilePath;
    if (data.type === "A") {
      if (data.audioFilePath) audio_name = data.audioFilePath;
      else audio_name = data.file_name;
    }
  }

  if (type === Type.VIDEO) {
    if (data.type === "TT_VD") video_name = data.video_name;

    if (data.type === "V") video_name = data.file_name;
  }

  if (type === Type.IMAGE) {
    if (data.type === "TT_IMG") {
      image_name = data.question_image;
      secondary_image_name = data.answer_image;
    }
    if (data.type === "I") image_name = data.audioFilePath;
    if (data.type === "P") image_name = data.file_name;
    if (data.type === "CNV") {
      image_name = data.picFileName;
    }
  }
  return {
    question: data.question,
    answer: data.answer,
    type,
    image_name,
    secondary_image_name,
    audio_name,
    video_name,
  };
}
