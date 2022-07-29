import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'spodcast-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  userInfo: SpotifyApi.UserObjectPublic | undefined = undefined;
  constructor(private userService: UserService) {
    //
  }

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe((info) => (this.userInfo = info));
  }
}
