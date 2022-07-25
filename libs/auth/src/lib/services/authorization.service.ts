import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { AuthInfo } from '../models/auth.model';

import { SPOTIFY_CONF } from '../spotify.conf';
@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  private authInfo: AuthInfo | undefined = undefined;
  private storageKey = 'spodcastAuth';

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private http: HttpClient) {
    const authInfo = localStorage.getItem(this.storageKey);
    if (authInfo) {
      this.authInfo = JSON.parse(authInfo);
    }
  }

  getAuthInfo() {
    return this.authInfo;
  }

  logout() {
    localStorage.clear();
    this.authInfo = undefined;
    this.router.navigate(['no-auth']);
  }

  autenticateFlow(): Observable<AuthInfo> {
    if (this.authInfo) {
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
        .post(SPOTIFY_CONF.SPOTIFY_ACCESS_TOKEN_URL, body.toString(), {
          headers: new HttpHeaders()
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .set('Authorization', 'Basic ' + btoa(SPOTIFY_CONF.CLIENT_ID + ':' + SPOTIFY_CONF.SECRET)),
        })
        .pipe(
          map((response: any) => {
            this.authInfo = {
              accessToken: response['access_token'],
              tokenType: response['token_type'],
              expiresIn: Number(response['expires_in']),
              refreshToken: response['refresh_token'],
            };
            console.log('navigate');
            localStorage.setItem(this.storageKey, JSON.stringify(this.authInfo));
            this.router.navigateByUrl('/');
            return this.authInfo;
          })
        );
    }

    return of({ accessToken: 'error', tokenType: 'error', expiresIn: -1, refreshToken: 'error' });
  }

  private redirectToAuthorizeURL() {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CONF.CLIENT_ID,
      redirect_uri: `${window.location.origin}${SPOTIFY_CONF.CALLBACK}`,
      scope: encodeURIComponent(SPOTIFY_CONF.SCOPES.join(' ')),
      response_type: 'code',
      code_challenge_method: 'fa5e962e91863cc3c04282bf4f732dc6017b0dec96ba91a785ff982b81d73783',
    });
    window.location.href = `${SPOTIFY_CONF.SPOTIFY_AUTHORIZE_URL}?${params.toString()}`;
  }
}
