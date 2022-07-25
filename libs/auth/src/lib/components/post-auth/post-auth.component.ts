import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthorizationService } from '../../services/authorization.service';

@Component({
  templateUrl: './post-auth.component.html',
  styleUrls: ['./post-auth.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PostAuthComponent implements OnInit {
  constructor(private authService: AuthorizationService) {}

  ngOnInit(): void {
    this.authService.autenticateFlow().subscribe();
  }
}
