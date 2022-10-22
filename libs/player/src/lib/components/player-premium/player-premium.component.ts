/// <reference types="spotify-web-playback-sdk" />
import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { AuthorizationService } from '@spoticast/auth';
import { PlaylistService } from '@spoticast/playlist';
import { PlayerService } from '../../services/player.service';

declare global {
  interface Window {
    player: any;
  }
}

@Component({
  selector: 'spoticast-player-premium',
  templateUrl: './player-premium.component.html',
  styleUrls: ['./player-premium.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PlayerPremiumComponent {
  isPlay = false;
  player: any;
  playlistId: string | undefined;
  deviceId: string | undefined;
  constructor(
    private auth: AuthorizationService,
    private playlistService: PlaylistService,
    private playerService: PlayerService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.playlistService.getUpdate().subscribe((playlist) => {
      this.playlistId = playlist?.uri;
    });
    this.player = window['player'];
    if (!this.player) {
      this.loadWebSDK();
    }
    window.onSpotifyWebPlaybackSDKReady = () => {
      // eslint-disable-next-line no-useless-escape
      const deviceName = navigator.userAgent.match(/^[^\(]+\((\w+)/) || [''];
      this.player = new Spotify.Player({
        name: 'Sposticast ' + deviceName[1] || deviceName[0],

        getOAuthToken: (cb) => {
          cb(auth.getAuthInfo()?.accessToken + '');
        },
        volume: 0.5,
      });
      window['player'] = this.player;

      this.player.addListener('ready', (response: any) => {
        this.deviceId = response.device_id;
        console.log('Ready with Device ID', response, this.deviceId);
        this.changeDetectorRef.detectChanges();
      });

      this.player.addListener('not_ready', (device_id: any) => {
        console.log('Device ID has gone offline', device_id);
      });
      this.player.addListener('initialization_error', (message: any) => {
        console.error(message);
      });

      this.player.addListener('authentication_error', (message: any) => {
        console.error(message);
      });
      this.player.addListener('autoplay_failed', () => {
        console.log('Autoplay is not allowed by the browser autoplay rules');
      });

      this.player.addListener('account_error', (message: any) => {
        console.error(message);
      });
      this.player.connect().then((success: any) => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        }
      });
    };

    window.onbeforeunload = (event) => {
      if (this.player) {
        this.player.disconnect();
      }
      console.log('xxxx');
      return false;
    };
  }

  private loadWebSDK() {
    const chatScript = document.createElement('script');
    chatScript.type = 'text/javascript';
    chatScript.async = true;
    chatScript.src = 'https://sdk.scdn.co/spotify-player.js';
    document.body.appendChild(chatScript);
  }

  previous() {
    this.player.previous();
  }
  back() {
    // this.playerService.seek().subscribe()
    this.player.disconnect();
  }

  play() {
    if (this.isPlay) {
      this.isPlay = false;
      this.player.pause();
    } else if (this.playlistId) {
      // this.player.connect().then((success: any) => {
      //   if (success) {

      //     console.log('The Web Playback SDK successfully connected to Spotify!');
      //   }
      // });
      this.playerService.play(this.playlistId || 'noplaylsit', this.deviceId).subscribe();
      console.log('play on ', this.deviceId);
      this.isPlay = true;
      this.player.activateElement();
      // this.player.resume()
    }
    this.changeDetectorRef.detectChanges();
  }
  forward() {
    // this.playerService.previous().subscribe()
  }
  next() {
    this.playerService.next().subscribe();
  }
}
