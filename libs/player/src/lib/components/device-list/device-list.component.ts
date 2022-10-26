import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BaseComponent, Device, EventService, EVENT_TYPE, SpoticastStoreService } from '@spoticast/shared';

import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'spoticast-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DeviceListComponent extends BaseComponent implements OnInit {
  devices: Device[] = [];
  deviceActive: Device | undefined;

  constructor(private playerService: PlayerService, private event: EventService, private store: SpoticastStoreService) {
    super();
  }

  ngOnInit(): void {
    this.destroyForMe = this.store.get('devices').subscribe((devices) => {
      this.devices = [...devices];
    });
    this.destroyForMe = this.store.get('execution').subscribe((execution) => {
      this.deviceActive = execution.device;
    });

    this.event.notifyEvent({ type: EVENT_TYPE.PLAYER_DEVICE_LIST });
  }

  changeDevice(device: Device) {
    this.event.notifyEvent({ type: EVENT_TYPE.PLAYER_CHANGE_DEVICE, payload: device });
  }
}
