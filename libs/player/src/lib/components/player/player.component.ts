import { Component, ViewEncapsulation } from '@angular/core';
import { PlaylistService } from '@spoticast/playlist';
import { UserService } from '@spoticast/shared';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'spoticast-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PlayerComponent {
  playlistId: string | undefined;
  firstEpisode: string | undefined;
  userId = 'userIDnonCaricato';
  constructor(
    private playerService: PlayerService,
    private playlistService: PlaylistService,
    private userService: UserService /*info:InfoService */
  ) {
    this.playlistService.getUpdate().subscribe((playlist) => {
      this.playlistId = playlist?.uri;
      this.firstEpisode = playlist?.tracks[0].id;
    });
    this.userService.getUserProfile().subscribe((user) => {
      this.userId = user.id;
    });
  }

  previous() {
    this.playerService.previous().subscribe();
  }
  back() {
    // this.playerService.seek().subscribe()
  }
  play() {
    const device = this.playerService.getActiveDevice();
    if (this.playlistId) {
      if (device) {
        this.playerService.play(this.playlistId).subscribe();
      } else {
        console.log(
          'open',
          'spotify:user:' +
            this.userId +
            ':playlist:' +
            this.playlistId.replace('spotify:playlist:', '') +
            ':episode:' +
            this.firstEpisode?.replace('spotify:episode:', '') +
            ':play'
        );
        window.open(
          'spotify:user:' + this.userId + ':playlist:' + this.playlistId.replace('spotify:playlist:', '') + ':play'
        );
      }
    }
  }
  forward() {
    // this.playerService.previous().subscribe()
  }
  next() {
    this.playerService.next().subscribe();
  }
}
