import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@spoticast/shared';
import { DeviceListComponent } from './components/device-list/device-list.component';
import { PlayerPremiumComponent } from './components/player-premium/player-premium.component';
import { PlayerComponent } from './components/player/player.component';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [DeviceListComponent, PlayerComponent, PlayerPremiumComponent],
  exports: [DeviceListComponent, PlayerComponent, PlayerPremiumComponent],
})
export class PlayerModule {}
