import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { EventService } from '@spoticast/shared';
import { PlayerEvents } from '../../events/player.events';
import { Device } from '../../models/device.model';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'spoticast-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DeviceListComponent implements OnInit {
  devices: Device[] | undefined;
  deviceActive: Device | undefined;
  cacheStatus = { devices: false, device: false };

  constructor(private playerService: PlayerService, private info: EventService) {}

  ngOnInit(): void {
    this.info.notifyMe([PlayerEvents.DEVICES_LIST, PlayerEvents.DEVICE_ACTIVE]).subscribe((event) => {
      switch (event.type) {
        case PlayerEvents.DEVICES_LIST:
          this.cacheStatus.devices = !!event.cached;
          this.manageDevices(event.payload);
          break;
        case PlayerEvents.DEVICE_ACTIVE:
          this.cacheStatus.devices = !!event.cached;
          this.manageDevice(event.payload);
          break;
      }
    });

    this.playerService.getDevices().subscribe();
  }
  manageDevice(payload: Device) {
    this.deviceActive = payload;
  }
  manageDevices(payload: Device[]) {
    this.devices = payload;
  }

  changeDevice(device: Device) {
    this.playerService.changeDevice(device).subscribe();
  }
}
