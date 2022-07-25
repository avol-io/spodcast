import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user.service';

@Component({
  selector: 'spodcast-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  userInfo: any;
  constructor(private userService: UserService) {
    //
  }

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe((info) => (this.userInfo = info));
  }
}
