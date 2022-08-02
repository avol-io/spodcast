import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SPOTIFY_CONF, UserService } from '@spodcast/shared';
import { BehaviorSubject, concatMap, filter, map, Observable, of, range, Subject, switchMap, take, tap } from 'rxjs';
import { PlaylistModel } from '../models/playlist.model';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private playlistLoaded: undefined | PlaylistModel = undefined;
  private notifyPlaylist: Subject<PlaylistModel | undefined> = new BehaviorSubject(this.playlistLoaded);

  constructor(private http: HttpClient, private userService: UserService) {
    //
  }

  getUpdate() {
    return this.notifyPlaylist.asObservable();
  }

  addEpisode(uri: string, position: number | undefined = undefined) {
    const body: any = { uris: [uri] };
    if (position != undefined) {
      body.position = position;
    }
    const url = SPOTIFY_CONF.API.PLAYLIST_GET_TRACKS.replace(':ID', this.playlistLoaded?.id || '');
    //
    return this.http.post(url, body).pipe(tap(() => this.refresh()));
  }
  deleteEpisode(uri: string) {
    const body: any = { tracks: [{ uri: uri }] };

    const url = SPOTIFY_CONF.API.PLAYLIST_GET_TRACKS.replace(':ID', this.playlistLoaded?.id || '');
    //
    return this.http.delete(url, { body: body }).pipe(tap(() => this.refresh()));
  }
  moveEpisode(atPosition: number, toPosition: number) {
    const body: any = { range_start: atPosition, insert_before: toPosition };

    const url = SPOTIFY_CONF.API.PLAYLIST_GET_TRACKS.replace(':ID', this.playlistLoaded?.id || '');
    //
    return this.http.put(url, body).pipe(tap(() => this.refresh()));
  }

  refresh() {
    if (this.playlistLoaded) {
      this.getPlaylist(this.playlistLoaded.id).subscribe();
    }
  }
  getPlaylist(id: string) {
    const url = SPOTIFY_CONF.API.PLAYLIST_GET.replace(':ID', id);
    return this.http.get<SpotifyApi.SinglePlaylistResponse>(url).pipe(
      map((response) => {
        if (response) {
          const tracks: SpotifyApi.TrackObjectFull[] = [];
          response.tracks.items.forEach((t) => {
            if (t.track) {
              tracks.push(t.track);
            }
          });
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
        this.notifyPlaylist.next(broadcastIt);
      })
    );
  }

  getPlaylistItems(id: string | SpotifyApi.PagingObject<SpotifyApi.PlaylistTrackObject>) {
    let url: string | undefined;
    if (typeof id == 'string') {
      url = SPOTIFY_CONF.API.PLAYLIST_GET_TRACKS.replace(':ID', id);
    } else {
      url = id.next || undefined;
    }
    if (!url) {
      return of(undefined);
    }
    return this.http.get<SpotifyApi.PagingObject<SpotifyApi.PlaylistTrackObject>>(url);
  }

  createPlaylist() {
    const userId = this.userService.userProfile?.id || '-1';
    const url = SPOTIFY_CONF.API.PLAYLIST_CREATE.replace(':ID_USER', userId);
    const body = {
      name: SPOTIFY_CONF.PLAYLIST_SPODCAST,
      public: false,
      collaborative: false,
      description: 'This playlist is used by Spodcast',
    };
    return this.http.post<SpotifyApi.CreatePlaylistResponse>(url, body).pipe(
      map((playlist) => {
        this.playlistLoaded = { id: playlist.id, snapshot_id: playlist.snapshot_id, nextTrack: null, tracks: [] };
        this.notifyPlaylist.next(this.playlistLoaded);
        return this.playlistLoaded;
      })
    );
  }

  checkSpodcastPlaylist(): Observable<PlaylistModel | undefined> {
    if (this.playlistLoaded) {
      return this.getPlaylist(this.playlistLoaded.id);
    }
    return this.findSpodcastPlaylist()
      .pipe
      // switchMap((response) => {
      //   if (response) {
      //     return of(response);
      //   }
      //   console.log('new one call');

      // })
      ();
  }

  private findSpodcastPlaylist() {
    if (this.playlistLoaded) {
      return of(this.playlistLoaded);
    }
    const url = SPOTIFY_CONF.API.PLAYLISTS_BY_USER;

    return range(1, 1000000).pipe(
      concatMap((page) => {
        const size = 50;
        const offset = (page - 1) * size;
        const queryParam = new HttpParams().set('offset', offset).set('limit', size);
        console.log('call!');
        return this.http.get<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(url, { params: queryParam });
      }),
      switchMap((response) => {
        //search in page the playlist
        const playlistFound = response.items.find((p) => {
          if (p.name == SPOTIFY_CONF.PLAYLIST_SPODCAST) {
            return true;
          } else {
            return false;
          }
        });

        console.log(this.playlistLoaded, !!response.next, !!playlistFound, playlistFound);
        if (playlistFound) {
          return this.getPlaylist(playlistFound.id);
        }
        return of(!response.next); //check if playlist is founded or no more page are present
      }),
      filter((remapped) => {
        if (typeof remapped == 'boolean' && remapped == true) {
          //if not playlist found and therearen't other page go foward
          return false;
        }
        return true;
      }),
      map((value) => {
        if (typeof value == 'boolean') {
          return undefined;
        }
        return value;
      }),
      take(1),
      // filter((response) => {
      //   console.log('filter', response)
      //   return !!this.playlistExist || !response.next; //fai passare appena trovi la playlist o se non c'è più next così vuoto
      // }),
      tap((playlist) => {
        if (playlist) {
          this.playlistLoaded = playlist;
        } else {
          this.playlistLoaded = undefined;
        }

        console.log('official response', this.playlistLoaded, playlist);
      })
    );
  }
}
