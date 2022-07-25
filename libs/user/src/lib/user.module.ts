import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthModule } from '@spodcast/auth';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

@NgModule({
  imports: [
    CommonModule,
    AuthModule,
    RouterModule.forChild([{ path: '', pathMatch: 'full', component: UserProfileComponent }]),
  ],
  declarations: [UserProfileComponent],
  exports: [UserProfileComponent],
})
export class UserModule {}
