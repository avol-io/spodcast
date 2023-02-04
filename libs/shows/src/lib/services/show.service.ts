/// <reference types="spotify-api" />

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Episode,
  EventService,
  EVENT_TYPE,
  getBestImage,
  Show,
  SpoticastStoreService,
  SPOTIFY_CONF,
} from '@spoticast/shared';
import { forkJoin, map, mergeMap, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShowService {
  playlistExist: string | undefined = undefined;

  constructor(private http: HttpClient, private store: SpoticastStoreService, private event: EventService) {
    this.event
      .notifyMe([
        EVENT_TYPE.SHOWS_LOAD_LIST,
        EVENT_TYPE.SHOWS_SEARCH,
        EVENT_TYPE.SHOW_LOAD_DETAIL,
        EVENT_TYPE.EPISODE_NEXT_LOAD,
        EVENT_TYPE.SHOW_ADD,
        EVENT_TYPE.SHOW_REMOVE,
      ])
      .subscribe((event) => {
        switch (event.type) {
          case EVENT_TYPE.SHOWS_LOAD_LIST:
            this.getShows().subscribe({
              next: (shows: Show[]) => {
                console.log('mah', shows);
                this.store.updateShowList(shows);
              },
              error: (err) => {
                alert('ERROR TODO');
                console.error('getShowDetail', err);
              },
            });
            break;
          case EVENT_TYPE.SHOW_LOAD_DETAIL:
            this.getShowDetail(event.payload).subscribe({
              next: (show: Show) => {
                this.store.updateShow(show);
              },
              error: (err) => {
                alert('ERROR TODO');
                console.error('getShowDetail', err);
              },
            });
            break;
          case EVENT_TYPE.EPISODE_NEXT_LOAD:
            this.getNextEpisodes(event.payload);
            break;
          case EVENT_TYPE.SHOWS_SEARCH:
          case EVENT_TYPE.SHOW_ADD:
          case EVENT_TYPE.SHOW_REMOVE:
            alert('Not implement yet');
        }
      });
  }

  private getShows(page = 1) {
    const size = 50;
    const offset = (page - 1) * size;
    const url = SPOTIFY_CONF.API.SHOWS;
    const queryParam = new HttpParams().set('offset', offset);

    return this.http.get<SpotifyApi.PagingObject<SpotifyApi.SavedShowObject>>(url, { params: queryParam }).pipe(
      mergeMap((dto) => {
        const showsObj: Observable<Show>[] = [];
        dto.items.forEach((iDto) => {
          showsObj.push(this.getShowDetail(iDto.show.id));
        });

        return forkJoin(showsObj);
      })
    );
  }
  private getShowDetail(idShow: string) {
    const url = SPOTIFY_CONF.API.SHOW_DETAIL.replace(':ID_SHOW', idShow);
    return this.http.get<SpotifyApi.ShowObject>(url).pipe(
      map((dto) => {
        const show = new Show();
        show.cover = getBestImage(dto.images).url;
        show.description = dto.description;
        show.name = dto.name;
        show.id = dto.id;
        show.uri = dto.uri;
        show.episodes = [];
        show.nextEpisodeURL = dto.episodes.next;
        dto.episodes.items.forEach((e) => {
          show.episodes.push(new Episode(e));
        });

        return show;
      })
    );
    //
  }

  private getNextEpisodes(show: Show) {
    if (show.nextEpisodeURL) {
      this.http.get<SpotifyApi.PagingObject<SpotifyApi.EpisodeObjectSimplified>>(show.nextEpisodeURL).subscribe({
        next: (episodes) => {
          show.updateDate = new Date().getTime();
          show.nextEpisodeURL = episodes.next;
          episodes.items.forEach((e) => {
            show.episodes.push(new Episode(e));
          });
          this.store.updateShow(show);
        },
        error: (err) => {
          alert('ERROR TODO');
          console.error('getShowDetail', err);
        },
      });
    }
    //https://api.spotify.com/v1/shows/1FaCiqGahURjjO42JOMiyd
  }
}
