
export function getControlUrlFromMatchPosition(matchPos: string) {
    switch (matchPos) {
      case "VCNV_Q":
        return "/admin/vcnv";
      case "KD":
        return "/admin/kd";
      case "TT_Q":
        return "/admin/tt";
      case "VD":
        return "/admin/vd";
      case "CHP":
        return "/admin/chp";
      case "H":
        return "";
      default:
        return "";
    }
  }