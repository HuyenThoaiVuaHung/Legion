import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Socket, io } from "socket.io-client";
import { environment } from "src/environments/environment";
import { MatchData } from "./types/match.data";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public socket: Socket = io();
  public matchData: MatchData = {} as MatchData;
  public roleId: Promise<number> = new Promise<number>((resolve) => {
    resolve()
  });
  constructor(private router: Router) {
    this.socket = io(environment.socketIp);
    if (localStorage.getItem("authString")) this.authenticate(); 
    else this.router.navigate(["/"]);
  }
  public authenticate(authId?: string) {
    this.socket.on("connect", () => {
      this.socket.emit(
        "init-authenticate",
        authId ? authId : localStorage.getItem("authString"),
        (callback: any) => {
          console.log("Connected");
          this.matchData = callback.matchData;
          this.roleId = callback.roleId;
          console.log(callback);
          if (callback.roleId == 0 || callback.roleId == 3) {
            if (this.matchData.matchPos != "KD") {
              switch (this.matchData.matchPos) {
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
          } else if (callback.roleId == 1) {
          }
        }
      );
    });
  }
}
