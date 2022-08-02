import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { SharedModule } from '@spodcast/shared';
import { PlaylistComponent } from './components/playlist/playlist.component';

@NgModule({
  imports: [CommonModule, SharedModule, HttpClientModule],
  declarations: [PlaylistComponent],
  exports: [PlaylistComponent],
})
export class PlaylistModule {}
