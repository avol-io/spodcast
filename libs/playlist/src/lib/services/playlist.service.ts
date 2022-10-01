import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SPOTIFY_CONF, UserService } from '@spoticast/shared';
import {
  BehaviorSubject,
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

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  /**
   * It's the cached model of playlist
   */
  private playlistLoaded: undefined | PlaylistModel = undefined;
  /**
   * it's a broadcast channel to update async all component that want the freshed playlist
   */
  private notifyPlaylist: Subject<PlaylistModel | undefined> = new BehaviorSubject(this.playlistLoaded);

  /**
   * The key use to store playlist
   */
  private STORAGE_KEY = 'spoticast_playlist';

  private debounceRefresh = new Subject<void>();

  constructor(private http: HttpClient, private userService: UserService) {
    //if playlist was stored i use it
    //note that playlist component call  checkspoticastPlaylist to be sure that playlist exist (and refresh it)
    const playlist = localStorage.getItem(this.STORAGE_KEY);
    if (playlist) {
      this.playlistLoaded = JSON.parse(playlist);
      this.notifyPlaylist.next(this.playlistLoaded);
    }

    //here it subscribe to all playlist cache to update storage copy
    this.notifyPlaylist.subscribe((playlist) => {
      if (playlist) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(playlist));
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    });

    //here a subscribe to debounce refresh
    this.debounceRefresh /*TODO.pipe(debounceTime(1000*30))*/
      .subscribe(() => {
        this.refresh();
      });
  }

  /**
   * Return observable where you can receive the freshed playlist
   * @returns
   */
  getUpdate(): Observable<PlaylistModel | undefined> {
    return this.notifyPlaylist.asObservable();
  }

  /**
   * Add episode to playlist
   * @param uri spotify uri of episode
   * @param position (optional) set the position where the episode will be added
   * @returns
   */
  addEpisode(uri: string, position: number | undefined = undefined) {
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
  deleteEpisode(uri: string) {
    const body: any = { tracks: [{ uri: uri }] };

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
  moveEpisode(atPosition: number, toPosition: number) {
    const body: any = { range_start: atPosition, insert_before: toPosition };

    const url = SPOTIFY_CONF.API.PLAYLIST_GET_TRACKS.replace(':ID', this.playlistLoaded?.id || '');
    //
    return this.http.put(url, body).pipe(tap(() => this.debounceRefresh.next()));
  }

  /**
   * Refresh the playlist.
   * If 404 occur it try to find the playlist before give undefined
   */
  refresh() {
    if (this.playlistLoaded) {
      this.getPlaylist(this.playlistLoaded.id)
        .pipe(
          catchError((e) => {
            this.playlistLoaded = undefined;
            if (e.status == 404) {
              return this.findspoticastPlaylist();
            }
            throw e;
          })
        )
        .subscribe();
    }
  }

  /**
   * Get the playlist from API and convert into our model
   * TODO: call for episode full detail using cache
   * @param id of playlist
   * @returns
   */
  getPlaylist(id: string) {
    const url = SPOTIFY_CONF.API.PLAYLIST_GET.replace(':ID', id);
    return this.http.get<SpotifyApi.SinglePlaylistResponse>(url).pipe(
      map((response) => {
        if (response) {
          const tracks: SpotifyApi.TrackObjectFull[] = this.convertEpisodes(response.tracks.items);
          const playlist: PlaylistModel = {
            id: response.id,
            nextTrack: response.tracks.next,
            tracks: tracks,
            snapshot_id: response.snapshot_id,
          };
          return playlist;
        }
        return undefined;
      }),
      tap((broadcastIt) => {
        this.playlistLoaded = broadcastIt;
        this.notifyPlaylist.next(broadcastIt);
      })
    );
  }

  /**
   * Convert episode from spotify format to spoticast simplify format
   * @param response
   * @returns
   */
  private convertEpisodes(response: SpotifyApi.PlaylistTrackObject[]) {
    const tracks: SpotifyApi.TrackObjectFull[] = [];
    response.forEach((t) => {
      if (t.track) {
        tracks.push(t.track);
      }
    });
    return tracks;
  }

  /**
   * Help function to load more episode based on next url.
   * @param next
   * @returns
   */
  loadMoreEpisode(next: string) {
    if (!next) {
      return of(undefined);
    }
    return this.http.get<SpotifyApi.PagingObject<SpotifyApi.PlaylistTrackObject>>(next).pipe(
      tap((response) => {
        if (this.playlistLoaded) {
          this.playlistLoaded.nextTrack = response.next;
        }
      }),
      map((response) => {
        return this.convertEpisodes(response.items);
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
  createPlaylist() {
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
        this.playlistLoaded = { id: playlist.id, snapshot_id: playlist.snapshot_id, nextTrack: null, tracks: [] };
        this.notifyPlaylist.next(this.playlistLoaded);
        return this.playlistLoaded;
      })
    );
  }

  /**
   * This is util method to check if playlist exist on spotify
   * @returns
   */
  checkspoticastPlaylist(): Observable<PlaylistModel | undefined> {
    if (this.playlistLoaded) {
      //if it's just loaded (for example from localstorage) it will quickly return it but it will refresh it in background
      return of(this.playlistLoaded).pipe(
        tap(() => {
          this.refresh();
        })
      );
    }
    //if not playlist it present it will find it
    return this.findspoticastPlaylist();
  }

  /**
   * Private method with the scope to find the spoticast playlist in spotify
   * @returns
   */
  private findspoticastPlaylist() {
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
