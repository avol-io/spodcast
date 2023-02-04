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
import { Episode } from '../models/episode.model';

import { PlaylistModel } from '../models/playlist.model';
import { User } from '../models/user.model';
import { SPOTIFY_CONF } from '../spotify.conf';
import { EventService } from './event.service';
import { SpoticastStoreService } from './spoticast-store.service';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private user: User | undefined;

  private playlistLoaded: PlaylistModel | undefined;
  private debounceRefresh = new Subject<void>();

  constructor(private http: HttpClient, private store: SpoticastStoreService, private event: EventService) {
    store.get('user').subscribe((user) => (this.user = user));
    this.debounceRefresh /*TODO.pipe(debounceTime(1000*30))*/
      .subscribe(() => {
        this.refresh();
      });
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
        .subscribe((playlist) => {
          this.store.updatePlaylist('normal', playlist as PlaylistModel);
        });
    }
  }
  private clearPlaylist(playlists: PlaylistModel | undefined) {
    if (!playlists) return of();
    const tracks: any = [];
    const trackFiltered: Episode[] = [];
    playlists.episodes.forEach((e) => {
      if (e.listened > 95) {
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
            playlists.episodes = trackFiltered;
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
              next: response.tracks.next,
              episodes: episodes,
              snapshot_id: response.snapshot_id,
              uri: response.uri,
            };
            return playlistTmp;
          })
        );
      })
    );
  }

  private getPlaylistEpisodes(ids: string) {
    const urlEpisodes = SPOTIFY_CONF.API.EPISODES;
    return this.http.get<SpotifyApi.MultipleEpisodesResponse>(urlEpisodes, { params: { ids: ids } }).pipe(
      map((episodes) => {
        const episodesConverted: Episode[] = this.convertEpisodes(episodes.episodes);
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
    const episodesConverted: Episode[] = [];

    response.forEach((e) => {
      episodesConverted.push(new Episode(e));
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
          this.playlistLoaded.next = response.next;
        }
      }),
      switchMap((response) => {
        let ids = '';
        response.items.forEach((t) => {
          ids += t.track?.id + ',';
        });
        ids = ids.substring(0, ids.length - 1);
        return this.getPlaylistEpisodes(ids);
      })
    );
  }

  /**
   * Create a playlist with spoticast name
   * @returns
   */
  private createPlaylist() {
    const userId = this.user?.id || '-1';
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
          next: null,
          episodes: [],
          uri: playlist.uri,
        };
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
