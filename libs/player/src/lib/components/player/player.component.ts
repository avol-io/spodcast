import { Component, ViewEncapsulation } from '@angular/core';
import { PlaylistService } from '@spoticast/playlist';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'spoticast-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PlayerComponent {
  playlistId: string | undefined;
  constructor(private playerService: PlayerService, private playlistService: PlaylistService /*info:InfoService */) {
    this.playlistService.getUpdate().subscribe((playlist) => {
      this.playlistId = playlist?.uri;
    });
  }

  previous() {
    this.playerService.previous().subscribe();
  }
  back() {
    // this.playerService.seek().subscribe()
  }
  play() {
    if (this.playlistId) {
      this.playerService.play(this.playlistId).subscribe();
    }
  }
  forward() {
    // this.playerService.previous().subscribe()
  }
  next() {
    this.playerService.next().subscribe();
  }
}
