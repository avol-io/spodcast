import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PlaylistModule } from '@spoticast/playlist';
import { SharedModule } from '@spoticast/shared';
import { GalleryComponent } from './componets/gallery/gallery.component';
import { ShowComponent } from './componets/show/show.component';
import { ListenedPipe } from './pipes/listened/listened.pipe';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    PlaylistModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: GalleryComponent },
      {
        path: ':idShow',
        children: [{ path: '', component: ShowComponent }],
      },
    ]),
  ],
  declarations: [GalleryComponent, ShowComponent, ListenedPipe],
})
export class ShowsModule {}
