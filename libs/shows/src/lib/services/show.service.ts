/// <reference types="spotify-api" />

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SPOTIFY_CONF } from '@spodcast/shared';
import { concatMap, filter, map, of, range, takeWhile } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShowService {
  playlistExist: string | undefined = undefined;

  constructor(private http: HttpClient) {}

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

  createSpodcastPlaylist() {}

  findSpodcastPlaylist() {
    if (this.playlistExist) {
      return of(true);
    }
    const url = SPOTIFY_CONF.API.PLAYLIST;
    return range(0, 1000000).pipe(
      concatMap((page) => {
        const size = 50;
        const offset = (page - 1) * size;
        const queryParam = new HttpParams().set('offset', offset).set('limit', size);
        return this.http.get<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(url, { params: queryParam });
      }),
      takeWhile(
        (response) =>
          !!response.next &&
          !!response.items.find((p) => {
            if (p.name == SPOTIFY_CONF.PLAYLIST_SPODCAST) {
              this.playlistExist = p.id;
              return false;
            } else {
              return true;
            }
          })
      ),
      filter((response) => {
        return !!this.playlistExist || !response.next; //fai passare appena trovi la playlist o se non c'è più next così vuoto
      }),
      map(() => {
        return this.playlistExist;
      })
    );
  }
}
