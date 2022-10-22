import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { SPOTIFY_CONF } from '@spoticast/shared';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
  SPOTIFY_CONF.CLIENT_ID = environment.client.id;
  SPOTIFY_CONF.SECRET = environment.client.secret;
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
