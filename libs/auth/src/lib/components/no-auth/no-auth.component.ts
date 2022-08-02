import { Component, ViewEncapsulation } from '@angular/core';
import { AuthorizationService } from '../../services/authorization.service';

@Component({
  templateUrl: './no-auth.component.html',
  styleUrls: ['./no-auth.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NoAuthComponent {
  constructor(private authService: AuthorizationService) {}

  reauth() {
    this.authService.autenticateFlow().subscribe();
  }
}
