import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthModule, AuthResolver } from '@spoticast/auth';
import { PlaylistModule } from '@spoticast/playlist';
import { SharedModule } from '@spoticast/shared';
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
            loadChildren: () => import('@spoticast/user').then((m) => m.UserModule),
          },
          {
            path: 'shows',
            loadChildren: () => import('@spoticast/shows').then((m) => m.ShowsModule),
          },
        ],
      },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
