import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
} from "@angular/router";
import { AuthService } from "../auth.service";

@Injectable({
  providedIn: "root",
})
export class MatchPosGuard implements CanActivate {
  constructor(private auth: AuthService) {}
  async canActivate(
    route: ActivatedRouteSnapshot
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        this.auth.socket.emit("get-match-position", (callback) => {
          if (route.url[0].path.toLowerCase().includes(callback.toLowerCase().replace('_', '-').replace('tt', 'tangtoc')))
            resolve(true);
          else reject("Invalid match position");
        });
      } catch (e) {
        console.log(e);
        reject(false);
      }
    });
  }
}
