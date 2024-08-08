import {
  computed,
  effect,
  Injectable,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Socket, io } from "socket.io-client";
import { environment } from "src/environments/environment";
import { MatchData, UserInfo } from "./types/match.data";
import { firstValueFrom } from "rxjs";
import { AppState } from "./types/app";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public readonly socket: Socket = io(environment.socketIp);

  public state: AppState = AppState.UNINITIALIZED;

  public readonly matchData: WritableSignal<MatchData> = signal(
    {} as MatchData
  );

  public userInfo: WritableSignal<UserInfo> = signal({
    roleId: -1,
    index: -1,
    socketId: "",
  });

  public socketHook: () => void = () => {};

  constructor(private router: Router, private snackBar: MatSnackBar) {
    this.initializeListeners();
    this.getMatchData().then((data) => {
      this.matchData.set(data);
      if (localStorage.getItem("authString")) {
        this.authenticate();
      }
    });

    effect(() => {
      this.navigateMatchPosition(this.matchData().matchPos);
    });
  }
  public authenticate(authId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        "init-authenticate",
        authId ? authId : localStorage.getItem("authString"),
        (callback: UserInfo) => {
          this.state = AppState.CONNECTED;
          resolve(this.userInfo.set(callback));
        }
      );
    });
  }

  public async getMatchData(): Promise<MatchData> {
    return new Promise((resolve, reject) => {
      this.socket.emit("get-match-data", (callback: MatchData) => {
        resolve(callback);
      });
    });
  }

  private initializeListeners() {
    this.socket.on("connect_error", (error) => {
      this.state = AppState.ERROR;
      this.snackBar.open("Lỗi kết nối", "Đóng", {
        duration: 5000,
        horizontalPosition: "start",
      });
    });
    this.socket.on("connect", () => {
      if (localStorage.getItem("authString")) this.authenticate();
    });
    this.socket.on("update-match-data", (data) => {
      this.matchData.set(data);
    });
  }

  public resetListeners() {
    this.socket.removeAllListeners();
    this.initializeListeners();
  }

  public deauthenticate() {
    localStorage.removeItem("authString");
    this.state = AppState.UNINITIALIZED;
    this.userInfo.set({ roleId: -1, index: -1, socketId: "" });
    this.socket.disconnect();
    this.socket.connect();
    this.resetListeners();
  }
  public reconnect() {
    this.resetListeners();
    this.socket.disconnect();
    this.socket.connect();
  }

  private navigateMatchPosition(matchPosition: string) {
    if (this.userInfo().roleId === 0 || this.userInfo().roleId === 3)
      switch (matchPosition) {
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

  public positionMap: Map<string, string> = new Map([
    ["KD", "Khởi động"],
    ["VCNV_Q", "Vượt chướng ngại vật - Câu hỏi"],
    ["VCNV_A", "Vượt chướng ngại vật - Trả lời"],
    ["TT_Q", "Tăng tốc - Câu hỏi"],
    ["TT_A", "Tăng tốc - Trả lời"],
    ["VD", "Về đích"],
    ["H", "Trang chủ"],
    ["PNTS", "Điểm"],
    ["CHP", "Câu hỏi phụ"],
  ]);
}
