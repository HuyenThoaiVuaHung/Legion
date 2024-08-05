import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Socket, io } from "socket.io-client";
import { environment } from "src/environments/environment";
import { MatchData, UserInfo } from "./types/match.data";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public readonly socket: Socket = io(environment.socketIp);
  public matchData: MatchData = {} as MatchData;
  public userInfo: UserInfo = {
    roleId: -1,
    index: -1,
    socketId: "",
  };
  public socketHook = () => {};
  public guardHook = () => {};
  constructor(private router: Router) {
    this.getMatchData();
    console.log(localStorage.getItem("authString") && router.url != "/");
    if (localStorage.getItem("authString") && router.url != "/")
      this.authenticate();
    else this.resetListeners();
  }
  public authenticate(authId?: string) {
    this.socket.emit(
      "init-authenticate",
      authId ? authId : localStorage.getItem("authString"),
      (callback: string) => console.log(callback)
    );
  }

  public getMatchData() {
    this.socket.emit("get-match-data", (callback: MatchData) => {
      this.matchData = callback;
    });
  }

  public resetListeners() {
    this.socket.removeAllListeners();
    this.socket.on("connect", () => {
      if (localStorage.getItem("authString")) this.authenticate();
    });
    this.socket.on(
      "authentication",
      (_matchData: MatchData, _userInfo: UserInfo) => {
        this.userInfo = _userInfo;
        console.debug(_userInfo);
        this.socketHook();
        this.guardHook();
        if (_userInfo.roleId == 1) return;
        this.navigateMatchPosition();
      }
    );
    this.socket.on("update-match-data", (data) => {
      this.matchData = data;
      if (this.userInfo.roleId == 1) return;
      this.navigateMatchPosition();
    });
  }
  public deauthenticate() {
    localStorage.removeItem("authString");
    this.socketHook = () => {};
    this.guardHook = () => {};
    this.userInfo = {
      roleId: -1,
      index: -1,
      socketId: "",
    };
    this.reconnect();
  }
  public reconnect() {
    this.socket.disconnect();
    this.socket.connect();
    this.resetListeners();
  }
  private navigateMatchPosition() {
    if (this.userInfo.roleId == 1 || this.userInfo.roleId == 2) return;
    console.log(this.matchData.matchPos + "nav");
    switch (this.matchData.matchPos) {
      case "KD":
        this.router.navigate(["/pl-kd"]);
        break;
      case "VCNV_Q":
        this.router.navigate(["/pl-vcnv-q"]);
        break;
      case "VCNV_A":
        this.router.navigate(["/pl-vcnv-a"]);
        break;
      case "TT_Q":
        this.router.navigate(["/pl-tangtoc-q"]);
        break;
      case "TT_A":
        this.router.navigate(["/pl-tangtoc-a"]);
        break;
      case "VD":
        this.router.navigate(["pl-vd"]);
        break;
      case "H":
        this.router.navigate([""]);
        break;
      case "PNTS":
        this.router.navigate(["/pnts"]);
        break;
      case "CHP":
        this.router.navigate(["/pl-chp"]);
    }
  }
}
