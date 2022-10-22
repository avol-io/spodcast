import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable } from 'rxjs';
import { AuthInfo } from '../models/auth.model';
import { AuthorizationService } from './authorization.service';

@Injectable({
  providedIn: 'root',
})
export class AuthResolver implements Resolve<AuthInfo> {
  constructor(private authService: AuthorizationService) {
    //
  }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): AuthInfo | Observable<AuthInfo> | Promise<AuthInfo> {
    return this.authService.autenticateFlow().pipe(
      catchError((error) => {
        this.authService.logout();
        throw error;
      })
    );
  }
}
