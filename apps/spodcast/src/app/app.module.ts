import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthModule, AuthResolver } from '@spodcast/auth';
import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AuthModule,
    RouterModule.forRoot([
      {
        path: '',
        resolve: { auth: AuthResolver },
        children: [
          {
            path: 'user',
            loadChildren: () => import('@spodcast/user').then((m) => m.UserModule),
          },
        ],
      },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
