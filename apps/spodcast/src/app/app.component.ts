import { Component } from '@angular/core';
import { AuthorizationService } from '@spodcast/auth';
@Component({
  selector: 'spodcast-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'spodcast';

  constructor(private auth: AuthorizationService) {}
  ngOnInit() {
    // this.auth.autenticateFlow().subscribe();
  }
}
