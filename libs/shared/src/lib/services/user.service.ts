import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { SPOTIFY_CONF } from '../spotify.conf';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  userProfile: SpotifyApi.UserObjectPublic | undefined = undefined;
  constructor(private http: HttpClient) {
    //
  }

  getUserProfile() {
    return this.http
      .get<SpotifyApi.UserObjectPublic>(SPOTIFY_CONF.API.ME)
      .pipe(tap((user) => (this.userProfile = user)));
  }
}
