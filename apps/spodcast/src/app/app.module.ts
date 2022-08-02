import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthModule, AuthResolver } from '@spodcast/auth';
import { PlaylistModule } from '@spodcast/playlist';
import { SharedModule } from '@spodcast/shared';
import { AppComponent } from './app.component';
import { LayoutComponent } from './componets/layout/layout.component';
import { NxWelcomeComponent } from './nx-welcome.component';

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent, LayoutComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AuthModule,
    SharedModule,
    PlaylistModule,
    RouterModule.forRoot([
      {
        path: '',
        component: LayoutComponent,
        resolve: { auth: AuthResolver },
        children: [
          {
            path: 'user',
            loadChildren: () => import('@spodcast/user').then((m) => m.UserModule),
          },
          {
            path: 'shows',
            loadChildren: () => import('@spodcast/shows').then((m) => m.ShowsModule),
          },
        ],
      },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
