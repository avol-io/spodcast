/// <reference types="spotify-api" />
import { Component, OnInit } from '@angular/core';
import { UserService } from '@spoticast/shared';

@Component({
  selector: 'spoticast-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  userInfo: SpotifyApi.UserObjectPublic | undefined = undefined;
  constructor(private userService: UserService) {
    //
  }

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe((info) => (this.userInfo = info));
  }
}
