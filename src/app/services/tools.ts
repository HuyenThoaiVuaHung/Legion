
export function getControlUrlFromMatchPosition(matchPos: string) {
    switch (matchPos) {
      case "VCNV_Q":
        return "/c-vcnv";
      case "KD":
        return "/c-kd";
      case "TT_Q":
        return "/c-tt";
      case "VD":
        return "/c-vd";
      case "CHP":
        return "/c-chp";
      case "H":
        return "";
      default:
        return "";
    }
  }