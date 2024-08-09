import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { AuthService } from "../auth.service";

@Injectable({
  providedIn: "root",
})
export class MatchPosGuard {
  constructor(private auth: AuthService) {}
  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        if (
          route.url[0].path
            .toLowerCase()
            .includes(
              this.auth
                .matchData()
                .matchPos.toLowerCase()
                .replace("_", "-")
                .replace("tt", "tangtoc")
            )
        )
          resolve(true);
        else reject("Invalid match position");
      } catch (e) {
        console.debug(e);
        reject(false);
      }
    });
  }
}
