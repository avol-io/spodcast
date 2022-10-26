import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  BaseComponent,
  Episode,
  EventService,
  EVENT_TYPE,
  PlaylistModel,
  SpoticastStoreService,
} from '@spoticast/shared';

@Component({
  selector: 'spoticast-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PlaylistComponent extends BaseComponent implements OnInit {
  playlistLoaded: PlaylistModel | undefined = undefined;
  episodeMap: { [key: string]: boolean } = {};
  loading = true;

  constructor(private event: EventService, private store: SpoticastStoreService) {
    super();
  }

  ngOnInit(): void {
    this.loading = true;
    console.log('caricato playlist component');
    this.store.get('playlist').subscribe((playlistLoaded) => {
      this.playlistLoaded = playlistLoaded;
      this.loading = false;
    });
    this.event.notifyEvent({ type: EVENT_TYPE.PLAYLIST_LOAD });
    // this.playlistService.checkSpoticastPlaylist().subscribe((pippo) => {
    //   this.playlistService.getUpdate().subscribe((playlist) => {
    //     this.playlistLoaded = playlist;
    //     this.loading = false;
    //   });
    // });
  }
  createPlaylist() {
    this.loading = true;
    this.event.notifyEvent({ type: EVENT_TYPE.PLAYLIST_CREATE });
  }

  // identifyEpisode(index: number, item: SpotifyApi.PlaylistTrackObject) {
  //   return item.id;
  // }
  checkPlaylist(clean = false) {
    this.loading = true;
    this.event.notifyEvent({ type: EVENT_TYPE.PLAYLIST_REFRESH, payload: { clean: clean } });
  }

  deleteEpisode(e: Episode) {
    this.loading = true;
    this.event.notifyEvent({ type: EVENT_TYPE.EPISODE_REMOVE, payload: e });
  }

  move(from: number, to: number) {
    this.loading = true;
    this.event.notifyEvent({ type: EVENT_TYPE.EPISODE_MOVE, payload: { from: from, to: to } });
  }

  // loadMore(forceReload = false) {
  //   if (this.playlistLoaded) {
  //     if (forceReload) {
  //       this.playlistLoaded.tracks = undefined;
  //       this.playlistService.getPlaylistItems(this.playlistLoaded.id).subscribe((response) => {
  //         if (this.playlistLoaded && response) {
  //           this.playlistLoaded.tracks = response;
  //         }
  //       });
  //     } else {
  //       this.playlistService.getPlaylistItems(this.playlistLoaded.id).subscribe({next:(response)=>{
  //         if (this.playlistLoaded && response) {
  //         this.playlistLoaded.tracks.next=response.next;
  //         this.playlistLoaded?.tracks?.items.push(response.)
  //         }
  //       }});
  //     }
  //   }
  // }
}
