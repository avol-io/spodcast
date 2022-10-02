import { Component, OnInit } from '@angular/core';
import { PlaylistModel } from '../../models/playlist.model';
import { PlaylistService } from '../../services/playlist.service';

@Component({
  selector: 'spoticast-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
})
export class PlaylistComponent implements OnInit {
  playlistLoaded: PlaylistModel | undefined = undefined;
  episodeMap: { [key: string]: boolean } = {};
  loading = true;

  constructor(private playlistService: PlaylistService) {}

  ngOnInit(): void {
    this.loading = true;
    console.log('caricato playlist component');
    this.playlistService.checkSpoticastPlaylist().subscribe((pippo) => {
      this.playlistService.getUpdate().subscribe((playlist) => {
        this.playlistLoaded = playlist;
        this.loading = false;
      });
    });
  }
  createPlaylist() {
    this.loading = true;
    this.playlistService.createPlaylist().subscribe();
  }

  // identifyEpisode(index: number, item: SpotifyApi.PlaylistTrackObject) {
  //   return item.id;
  // }
  checkPlaylist() {
    this.loading = true;
    this.playlistService.refresh();
  }

  deleteEpisode(e: SpotifyApi.TrackObjectFull) {
    this.loading = true;
    this.playlistService.deleteEpisode(e.uri).subscribe((done) => {
      alert('Eliminato');
    });
  }

  move(from: number, to: number) {
    this.loading = true;
    this.playlistService.moveEpisode(from, to).subscribe();
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
