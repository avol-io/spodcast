import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  catchError,
  concatMap,
  map,
  mergeMap,
  Observable,
  of,
  retryWhen,
  Subject,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import { PlaylistModel } from '../models/playlist.model';
import { EventService } from './event.service';
import { SpoticastStoreService } from './spoticast-store.service';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  user: any;
  /**
   * The key use to store playlist
   */
  private STORAGE_KEY = 'spoticast_playlist';

  private debounceRefresh = new Subject<void>();

  constructor(private http: HttpClient, private store: SpoticastStoreService, private event: EventService) {
    store.get('');
  }

  /**
   * Return observable where you can receive the freshed playlist
   * @returns
   */
  private getUpdate(): Observable<PlaylistModel | undefined> {
    return this.notifyPlaylist.asObservable();
  }

  /**
   * Add episode to playlist
   * @param uri spotify uri of episode
   * @param position (optional) set the position where the episode will be added
   * @returns
   */
  private addEpisode(uri: string, position: number | undefined = undefined) {
    const body: any = { uris: [uri] };
    if (position != undefined) {
      body.position = position;
    }
    const url = SPOTIFY_CONF.API.PLAYLIST_GET_TRACKS.replace(':ID', this.playlistLoaded?.id || '');
    //
    return this.http.post(url, body).pipe(
      tap(() => this.debounceRefresh.next())
      // tap(()=>{
      //   if(this.playlistLoaded){
      //     const index=position||0;
      //     this.playlistLoaded.tracks.splice(index, 0, 'blue')
      //   }
      // })
    );
  }

  /**
   * Delete episode from playlist
   * @param uri spotify uri of episode
   * @returns
   */
  private deleteEpisode(uri: string) {
    const body = { tracks: [{ uri: uri }] };

    const url = SPOTIFY_CONF.API.PLAYLIST_GET_TRACKS.replace(':ID', this.playlistLoaded?.id || '');
    //
    return this.http.delete(url, { body: body }).pipe(tap(() => this.debounceRefresh.next()));
  }

  /**
   * Move episode from atPosition to toPosition (position use array style)
   * @param atPosition
   * @param toPosition
   * @returns
   */
  private moveEpisode(atPosition: number, toPosition: number) {
    const body = { range_start: atPosition, insert_before: toPosition };

    const url = SPOTIFY_CONF.API.PLAYLIST_GET_TRACKS.replace(':ID', this.playlistLoaded?.id || '');
    //
    return this.http.put(url, body).pipe(tap(() => this.debounceRefresh.next()));
  }

  /**
   * Refresh the playlist.
   * If 404 occur it try to find the playlist before give undefined
   */
  private refresh(clean = false) {
    if (this.playlistLoaded) {
      this.getPlaylist(this.playlistLoaded.id)
        .pipe(
          switchMap((playlists: PlaylistModel | undefined) => {
            if (clean) {
              return this.clearPlaylist(playlists);
            } else {
              return of(playlists);
            }
          }),
          catchError((e) => {
            this.playlistLoaded = undefined;
            if (e.status == 404) {
              return this.findSpoticastPlaylist();
            }
            throw e;
          })
        )
        .subscribe();
    }
  }
  private clearPlaylist(playlists: PlaylistModel | undefined) {
    if (!playlists) return of();
    const tracks: any = [];
    const trackFiltered: PlaylistEpisode[] = [];
    playlists.tracks.forEach((e) => {
      if (e.resume_point < 0) {
        tracks.push({ uri: e.uri });
      } else {
        trackFiltered.push(e);
      }
    });
    if (tracks.length > 0) {
      return this.http
        .delete(SPOTIFY_CONF.API.PLAYLIST_GET_TRACKS.replace(':ID', playlists.id), { body: { tracks: tracks } })
        .pipe(
          tap(() => {
            playlists.tracks = trackFiltered;
            this.notifyPlaylist.next(playlists);
          })
        );
    }
    return of();
  }

  /**
   * Get the playlist from API and convert into our model
   * TODO: call for episode full detail using cache
   * @param id of playlist
   * @returns
   */
  private getPlaylist(id: string) {
    const url = SPOTIFY_CONF.API.PLAYLIST_GET.replace(':ID', id);
    return this.http.get<SpotifyApi.SinglePlaylistResponse>(url).pipe(
      switchMap((response) => {
        let ids = '';
        response.tracks.items.forEach((t) => {
          ids += t.track?.id + ',';
        });
        ids = ids.substring(0, ids.length - 1);
        // ids=''+response.tracks.items[0].track?.id+','+response.tracks.items[1].track?.id;
        return this.getPlaylistEpisodes(ids).pipe(
          map((episodes) => {
            const playlistTmp: PlaylistModel = {
              id: response.id,
              nextTrack: response.tracks.next,
              tracks: episodes,
              snapshot_id: response.snapshot_id,
              uri: response.uri,
            };
            return playlistTmp;
          })
        );
      }),

      tap((broadcastIt) => {
        this.playlistLoaded = broadcastIt;
        this.notifyPlaylist.next(broadcastIt);
      })
    );
  }

  private getPlaylistEpisodes(ids: string) {
    const urlEpisodes = SPOTIFY_CONF.API.EPISODES;
    return this.http.get<SpotifyApi.MultipleEpisodesResponse>(urlEpisodes, { params: { ids: ids } }).pipe(
      map((episodes) => {
        const episodesConverted: PlaylistEpisode[] = this.convertEpisodes(episodes.episodes);
        return episodesConverted;
      })
    );
  }

  /**
   * Convert episode from spotify format to spoticast simplify format
   * @param response
   * @returns
   */
  private convertEpisodes(response: SpotifyApi.EpisodeObject[]) {
    const episodesConverted: PlaylistEpisode[] = [];

    response.forEach((e) => {
      episodesConverted.push({
        id: e.id,
        uri: e.uri,
        duration_ms: e.duration_ms,
        is_playable: e.is_playable,
        description: e.description,
        html_description: e.html_description,
        images: e.images[0].url,
        name: e.name,
        release_date: e.release_date,
        resume_point: e.resume_point?.fully_played ? -1 : e.resume_point?.resume_position_ms || 0,
      });
    });

    return episodesConverted;
  }

  /**
   * Help function to load more episode based on next url.
   * @param next
   * @returns
   */
  private loadMoreEpisode(next: string) {
    if (!next) {
      return of(undefined);
    }
    return this.http.get<SpotifyApi.PagingObject<SpotifyApi.PlaylistTrackObject>>(next).pipe(
      tap((response) => {
        if (this.playlistLoaded) {
          this.playlistLoaded.nextTrack = response.next;
        }
      }),
      switchMap((response) => {
        let ids = '';
        response.items.forEach((t) => {
          ids += t.track?.id + ',';
        });
        ids = ids.substring(0, ids.length - 1);
        return this.getPlaylistEpisodes(ids);
      }),
      tap((episodes) => {
        if (this.playlistLoaded) {
          this.playlistLoaded.tracks.push(...episodes);
          this.notifyPlaylist.next(this.playlistLoaded);
        }
      })
    );
  }

  /**
   * Create a playlist with spoticast name
   * @returns
   */
  private createPlaylist() {
    const userId = this.userService.userProfile?.id || '-1';
    const url = SPOTIFY_CONF.API.PLAYLIST_CREATE.replace(':ID_USER', userId);
    const body = {
      name: SPOTIFY_CONF.PLAYLIST_spoticast,
      public: false,
      collaborative: false,
      description: 'This playlist is used by spoticast',
    };
    return this.http.post<SpotifyApi.CreatePlaylistResponse>(url, body).pipe(
      map((playlist) => {
        this.playlistLoaded = {
          id: playlist.id,
          snapshot_id: playlist.snapshot_id,
          nextTrack: null,
          tracks: [],
          uri: playlist.uri,
        };
        this.notifyPlaylist.next(this.playlistLoaded);
        return this.playlistLoaded;
      })
    );
  }

  /**
   * This is util method to check if playlist exist on spotify
   * @returns
   */
  private checkSpoticastPlaylist(): Observable<PlaylistModel | undefined> {
    if (this.playlistLoaded) {
      //if it's just loaded (for example from localstorage) it will quickly return it but it will refresh it in background
      return of(this.playlistLoaded).pipe(
        tap(() => {
          this.refresh();
        })
      );
    }
    //if not playlist it present it will find it
    return this.findSpoticastPlaylist();
  }

  /**
   * Private method with the scope to find the spoticast playlist in spotify
   * @returns
   */
  private findSpoticastPlaylist() {
    if (this.playlistLoaded) {
      return of(this.playlistLoaded);
    }
    const url = SPOTIFY_CONF.API.PLAYLISTS_BY_USER;
    let page = 1;
    return of(null).pipe(
      concatMap(() => {
        const size = 50;
        const offset = (page - 1) * size;
        page++;
        const queryParam = new HttpParams().set('offset', offset).set('limit', size);
        return this.http.get<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(url, { params: queryParam });
      }),
      switchMap((response) => {
        //search playlist into page received
        const playlistFound = response.items.find((p) => {
          if (p.name == SPOTIFY_CONF.PLAYLIST_spoticast) {
            return true;
          } else {
            return false;
          }
        });

        //if found i will ask for complete details of playlist
        if (playlistFound) {
          return this.getPlaylist(playlistFound.id);
        }
        //if not but there are still more page of result use this terrible approach to retry with next page
        if (response.next) {
          throw new Error('next page');
        }

        //If arrive here it meaning that playlist not exist
        return of(undefined);
      }),
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((value: Error) => {
            if (value.message == 'next page') {
              return of(value);
            }
            return throwError(value);
          })
        )
      )
    );
  }
}
