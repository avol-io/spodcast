import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EventService, SPOTIFY_CONF } from '@spoticast/shared';
import { map } from 'rxjs';
import { PlayerEvents } from '../events/player.events';
import { Device } from '../models/device.model';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  //check disponibilità device
  //non visualizzare cosa riproduce in quel momento
  //

  private device: Device | undefined;
  private devices: Device[] | undefined;

  constructor(private http: HttpClient, private info: EventService) {}

  getDevices() {
    const event = { type: PlayerEvents.DEVICES_LIST, payload: this.devices, caches: true };
    return this.info.notifyCached<Device[]>(
      event,
      this.http.get<SpotifyApi.UserDevicesResponse>(SPOTIFY_CONF.API.GET_DEVICES).pipe(
        map((response) => {
          const devices: Device[] = [];
          response.devices.forEach((d) => {
            devices.push(new Device(d));
          });
          this.devices = devices;
          return devices;
        })
      )
    );
  }

  changeDevice(device: Device) {
    this.devices?.forEach((f) => {
      if (f.active) {
        f.dto.is_active = false;
      }
    });
    device.dto.is_active = true;
    this.device = device;

    const url = SPOTIFY_CONF.API.PLAY + '?device_id=' + device.id;
    const request: SpotifyApi.PlayParameterObject = { device_id: this.device.id || 'no_id' };

    const event = { type: PlayerEvents.DEVICE_ACTIVE, payload: this.device, cached: true };
    return this.info.notifyCached<Device>(
      event,
      this.http.put(url, {}).pipe(
        map(() => {
          return device;
        })
      )
    );
  }

  play(what: string, itemGoto?: string, position?: number) {
    const request: SpotifyApi.PlayParameterObject = { context_uri: what };
    if (itemGoto) {
      request.offset = { uri: itemGoto };
    }
    if (position) {
      request.position_ms = position;
    }
    const url = SPOTIFY_CONF.API.PLAY;
    return this.http.put(url, request).pipe();
  }

  next() {
    return this.http.post(SPOTIFY_CONF.API.NEXT, {});
  }

  previous() {
    return this.http.post(SPOTIFY_CONF.API.PREVIOUS, {});
  }

  seek(position: number) {
    return this.http.post(SPOTIFY_CONF.API.SEEK, { position_ms: position, device_id: this.device });
  }
}
