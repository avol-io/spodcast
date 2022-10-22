import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AuthModule, AuthResolver } from '@spoticast/auth';
import { PlayerModule } from '@spoticast/player';
import { PlaylistModule } from '@spoticast/playlist';
import { SharedModule } from '@spoticast/shared';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { LayoutComponent } from './componets/layout/layout.component';

@NgModule({
  declarations: [AppComponent, LayoutComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AuthModule,
    SharedModule,
    PlaylistModule,
    PlayerModule,
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
          { path: '', redirectTo: '/shows', pathMatch: 'full' },
        ],
      },
    ]),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
