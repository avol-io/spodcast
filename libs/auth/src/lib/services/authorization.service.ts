import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SPOTIFY_CONF } from '@spoticast/shared';
import { debounceTime, map, Observable, of } from 'rxjs';
import { AuthInfo } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  private authInfo: AuthInfo | undefined = undefined;
  private AUTH_KEY = 'spoticastAuth';
  private NO_AUTH_CALLBACK_KEY = 'spoticastCallback';
  private pathBack: string | undefined;
  private timer: any;
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private http: HttpClient) {
    const authInfo = localStorage.getItem(this.AUTH_KEY);
    if (authInfo) {
      this.authInfo = JSON.parse(authInfo);
      this.checkRefreshToken();
    }
  }

  getAuthInfo() {
    return this.authInfo;
  }

  logout(noAuth = false) {
    if (this.pathBack) {
      return;
    }
    localStorage.clear();
    this.authInfo = undefined;
    if (noAuth) {
      this.pathBack = window.location.pathname + window.location.search;
      localStorage.setItem(this.NO_AUTH_CALLBACK_KEY, this.pathBack);
    }
    this.router.navigate(['no-auth']);
  }

  autenticateFlow(): Observable<AuthInfo> {
    if (this.authInfo) {
      const dueDate = this.authInfo.expiresIn - new Date().valueOf();
      console.log('token will due', new Date(new Date().valueOf() + dueDate));
      if (dueDate < 0) {
        return this.refreshToken(this.authInfo.refreshToken);
      }
      return of(this.authInfo);
    }
    if (window.location.pathname != SPOTIFY_CONF.CALLBACK) {
      this.redirectToAuthorizeURL();
    }
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.has('code')) {
      const code = searchParams.get('code') || '';
      const body = new URLSearchParams();
      body.set('grant_type', 'authorization_code');
      body.set('redirect_uri', `${window.location.origin}${SPOTIFY_CONF.CALLBACK}`);

      body.set('code', code);
      body.set('client_id', SPOTIFY_CONF.CLIENT_ID);
      body.set('code_verifier', 'fa5e962e91863cc3c04282bf4f732dc6017b0dec96ba91a785ff982b81d73783');
      console.log('to access token');
      return this.http
        .post(SPOTIFY_CONF.API.ACCESS_TOKEN_URL, body.toString(), {
          headers: new HttpHeaders()
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Basic ' + btoa(SPOTIFY_CONF.CLIENT_ID + ':' + SPOTIFY_CONF.SECRET)),
        })
        .pipe(
          map((response: any) => {
            const expireTime = new Date(new Date().valueOf() + response['expires_in'] * 1000).valueOf();
            this.authInfo = {
              accessToken: response['access_token'],
              tokenType: response['token_type'],
              expiresIn: expireTime,
              refreshToken: response['refresh_token'],
            };
            localStorage.setItem(this.AUTH_KEY, JSON.stringify(this.authInfo));
            const callback = localStorage.getItem(this.NO_AUTH_CALLBACK_KEY) || '/';
            this.pathBack = undefined;
            this.router.navigateByUrl(callback);
            return this.authInfo;
          })
        );
    }

    return of({ accessToken: 'error', tokenType: 'error', expiresIn: -1, refreshToken: 'error' }).pipe(
      debounceTime(3000)
    );
  }

  private redirectToAuthorizeURL() {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CONF.CLIENT_ID,
      redirect_uri: `${window.location.origin}${SPOTIFY_CONF.CALLBACK}`,
      scope: SPOTIFY_CONF.SCOPES.join(' '),
      response_type: 'code',
      code_challenge_method: 'fa5e962e91863cc3c04282bf4f732dc6017b0dec96ba91a785ff982b81d73783',
    });
    window.location.href = `${SPOTIFY_CONF.API.AUTHORIZE_URL}?${params.toString()}`;
  }

  private refreshToken(refreshCode: string) {
    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');

    body.set('refresh_token', refreshCode);
    body.set('client_id', SPOTIFY_CONF.CLIENT_ID);
    console.log('refresh token');
    return this.http
      .post(SPOTIFY_CONF.API.ACCESS_TOKEN_URL, body.toString(), {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .set('Authorization', 'Basic ' + btoa(SPOTIFY_CONF.CLIENT_ID + ':' + SPOTIFY_CONF.SECRET)),
      })
      .pipe(
        map((response: any) => {
          console.log('eccolo risposta refresh', response);
          const expireTime = new Date(new Date().valueOf() + response['expires_in'] * 1000).valueOf();
          this.authInfo = {
            accessToken: response['access_token'],
            tokenType: response['token_type'],
            expiresIn: expireTime,
            refreshToken: response['refresh_token'] || this.authInfo?.refreshToken,
          };
          localStorage.setItem(this.AUTH_KEY, JSON.stringify(this.authInfo));
          this.checkRefreshToken();
          return this.authInfo;
        })
      );
  }

  checkRefreshToken() {
    if (this.authInfo != undefined) {
      const dueDate = this.authInfo.expiresIn - new Date().valueOf();
      if (dueDate > 0) {
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
          this.refreshToken(this.authInfo ? this.authInfo.refreshToken : 'nocode').subscribe();
        }, dueDate);
      }
    }
  }
}
