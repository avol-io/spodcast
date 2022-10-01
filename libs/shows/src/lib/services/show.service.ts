/// <reference types="spotify-api" />

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SPOTIFY_CONF, UserService } from '@spoticast/shared';

@Injectable({
  providedIn: 'root',
})
export class ShowService {
  playlistExist: string | undefined = undefined;

  constructor(private http: HttpClient, private userService: UserService) {}

  getShows(page = 1) {
    const size = 50;
    const offset = (page - 1) * size;
    const url = SPOTIFY_CONF.API.SHOWS;
    const queryParam = new HttpParams().set('offset', offset);
    return this.http.get<SpotifyApi.PagingObject<SpotifyApi.SavedShowObject>>(url, { params: queryParam });
  }
  getShow(idShow: string) {
    const url = SPOTIFY_CONF.API.SHOW_DETAIL.replace(':ID_SHOW', idShow);

    return this.http.get<SpotifyApi.ShowObject>(url);
  }

  getNextEpisodes(next: string) {
    return this.http.get<SpotifyApi.PagingObject<SpotifyApi.EpisodeObjectSimplified>>(next);
    //https://api.spotify.com/v1/shows/1FaCiqGahURjjO42JOMiyd
  }
}
