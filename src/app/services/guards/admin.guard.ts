import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard  {
  constructor(private auth: AuthService){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {
        try {
          this.auth.socket.emit('verify-identity', localStorage.getItem('authString'), (callback) => {
            if (callback == 1) resolve(true);
            else reject("Invalid token");
          });
        }
        catch(e) {
          reject("An unknown error occured");
        }
      });
  }
  
}
