import { Injectable } from '@angular/core';

import { BehaviorSubject, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { BaseModel } from '../models/base.model';
import { Device } from '../models/device.model';
import { Episode } from '../models/episode.model';
import { PlaylistModel } from '../models/playlist.model';
import { Show } from '../models/show.model';

export interface SpoticastState {
  shows: { [id: string]: Show };
  episodes: { [id: string]: Episode }; //episode it's shared memory
  playlist: { normal: PlaylistModel | undefined; smart: PlaylistModel | undefined };
  playlistEpisodes: { [id: string]: Episode };
  execution: { episode: Episode | undefined; device: Device | undefined; [id: string]: any };
  devices: { [id: string]: Device };
  user: User;
}
export type STORE_TOPIC = 'shows' | 'episodes' | 'playlist' | 'execution' | 'devices' | 'user';

@Injectable({
  providedIn: 'root',
})
export class SpoticastStoreService {
  private channel: BehaviorSubject<SpoticastState>;
  private store: SpoticastState = {
    shows: {},
    episodes: {},
    playlist: { normal: undefined, smart: undefined },
    playlistEpisodes: {},
    execution: { episode: undefined, device: undefined },
    devices: {},
  };
  constructor() {
    this.channel = new BehaviorSubject<SpoticastState>(this.store);
  }

  get(topic: STORE_TOPIC, id?: string | number) {
    return this.channel.asObservable().pipe(
      debounceTime(150),
      map((store) => {
        if (id && store[topic]) {
          return (store[topic] as any)[id];
        }
        return store[topic];
      }),
      distinctUntilChanged((p, n) => {
        if (p instanceof BaseModel && n instanceof BaseModel) {
          return p.creationDate == n.creationDate;
        }
        return p === n;
      })
    );
  }
  private notify() {
    this.channel.next(this.store);
  }
  updateShowList(shows: Show[]) {
    shows.forEach((s) => {
      this.updateShow(s);
    });
    this.notify();
  }
  updateShow(show: Show) {
    this.store.shows[show.id] = show;
    show.episodes.forEach((e) => {
      this.updateEpisode(e);
    });
    this.notify();
  }
  private updateEpisode(e: Episode) {
    const exist = this.store.episodes[e.id];
    if (exist && exist.creationDate < e.creationDate) {
      this.store.episodes[e.id] = e;
    }
  }
  updatePlaylist(which: 'normal' | 'smart', playlistNew: PlaylistModel) {
    this.store.playlist[which] = playlistNew;
    this.store.playlistEpisodes = {};
    playlistNew.tracks.forEach((e) => {
      this.store.playlistEpisodes[e.id] = e;
    });
    this.notify();
  }

  updateDevices(devices: Device[]) {
    devices.forEach((d) => {
      this.store.devices[d.id] = d;
    });
    this.notify();
  }
  updateDevice(device: Device) {
    if (device.active) {
      this.store.execution.device = device;
    }
    this.store.devices[device.id] = device;
    this.notify();
  }

  getCachedShow(id: string | number): Show {
    return this.store.shows[id];
  }

  getCachedEpisode(id: string | number) {
    return this.store.episodes[id];
  }

  getDevices() {
    return this.store.devices;
  }

  getActiveDevice() {
    return this.store.execution.device;
  }

  isInPlaylist(id: string) {
    return !!this.store.playlistEpisodes[id];
  }
}
