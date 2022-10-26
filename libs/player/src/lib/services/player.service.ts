import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Device, Episode, EventService, EVENT_TYPE, SpoticastStoreService, SPOTIFY_CONF } from '@spoticast/shared';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  constructor(private http: HttpClient, private event: EventService, private store: SpoticastStoreService) {
    this.event
      .notifyMe([
        EVENT_TYPE.PLAYER_CHANGE_DEVICE,
        EVENT_TYPE.PLAYER_DEVICE_LIST,
        EVENT_TYPE.PLAYER_BACKWARD,
        EVENT_TYPE.PLAYER_FORWARD,
        EVENT_TYPE.PLAYER_NEXT,
        EVENT_TYPE.PLAYER_PREVIOUS,
        EVENT_TYPE.PLAYER_PLAY,
        EVENT_TYPE.PLAYER_PAUSE,
        EVENT_TYPE.PLAYER_UPDATE_INFO,
      ])
      .subscribe((event) => {
        const p = event.payload;
        switch (event.type) {
          case EVENT_TYPE.PLAYER_CHANGE_DEVICE:
            this.changeDevice(event.payload).subscribe();
            break;
          case EVENT_TYPE.PLAYER_DEVICE_LIST:
            this.getDevices().subscribe();
            break;
          case EVENT_TYPE.PLAYER_BACKWARD:
            alert('TODO');
            break;
          case EVENT_TYPE.PLAYER_FORWARD:
            // this.play(p.what,p.where,p.item,p.tiem)
            alert('TODO');
            break;
          case EVENT_TYPE.PLAYER_NEXT:
            this.next();
            break;
          case EVENT_TYPE.PLAYER_PREVIOUS:
            this.previous();
            break;
          case EVENT_TYPE.PLAYER_PLAY:
            this.play(p.what, p.where, p.item);
            break;
          case EVENT_TYPE.PLAYER_PAUSE:
            break;
          case EVENT_TYPE.PLAYER_UPDATE_INFO:
            alert('TODO');
            break;
        }
      });
  }

  private getDevices() {
    return this.http
      .get<SpotifyApi.UserDevicesResponse>(SPOTIFY_CONF.API.GET_DEVICES)
      .pipe(
        map((response) => {
          const devices: Device[] = [];
          response.devices.forEach((d) => {
            devices.push(new Device(d));
          });
          this.store.updateDevices(devices);
          return devices;
        })
      )
      .subscribe();
  }

  private changeDevice(device: Device) {
    const url = SPOTIFY_CONF.API.PLAY + '?device_id=' + device.id;
    const request = { device_id: device.id || 'no_id' };

    return this.http
      .put(url, {}, { params: request })
      .pipe(
        map(() => {
          this.store.updateDevice(device);
          return device;
        })
      )
      .subscribe();
  }

  private play(what: string, where?: string, itemGoto?: Episode, position?: number) {
    const request: SpotifyApi.PlayParameterObject = { context_uri: what };
    const query: any = {};
    if (itemGoto) {
      request.offset = { uri: itemGoto.uri };
    }
    if (position) {
      request.position_ms = position;
    }
    const activeDevice = this.store.getActiveDevice();
    if (activeDevice) {
      query.device_id = activeDevice.id + '';
    }
    if (where) {
      query.device_id = where + '';
    }
    const url = SPOTIFY_CONF.API.PLAY;
    return this.http.put(url, request, { params: query }).pipe().subscribe();
  }

  private next() {
    return this.http.post(SPOTIFY_CONF.API.NEXT, {}).subscribe();
  }

  private previous() {
    return this.http.post(SPOTIFY_CONF.API.PREVIOUS, {}).subscribe();
  }

  // private seek(position: number) {
  //   return this.http.post(SPOTIFY_CONF.API.SEEK, { position_ms: position, device_id: this.device });
  // }
}
