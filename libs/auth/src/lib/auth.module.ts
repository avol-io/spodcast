import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@spoticast/shared';

import { NoAuthComponent } from './components/no-auth/no-auth.component';
import { PostAuthComponent } from './components/post-auth/post-auth.component';
import { SpotifyApiInterceptor } from './interceptors/spotify-api.intercetor';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    RouterModule.forChild([
      { path: 'post-auth', pathMatch: 'full', component: PostAuthComponent },
      { path: 'no-auth', pathMatch: 'full', component: NoAuthComponent },
    ]),
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useExisting: SpotifyApiInterceptor, multi: true }],
  declarations: [PostAuthComponent, NoAuthComponent],
})
export class AuthModule {}
