import { Component } from '@angular/core';
import { AuthorizationService } from '@spoticast/auth';
@Component({
  selector: 'spoticast-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'spoticast';

  constructor(private auth: AuthorizationService) {}
  ngOnInit() {
    // this.auth.autenticateFlow().subscribe();
  }
}
