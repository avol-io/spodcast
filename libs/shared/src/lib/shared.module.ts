import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UserComponent } from './components/user/user.component';
import { EllipsisPipe } from './pipes/ellipsis/ellipsis.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [EllipsisPipe, UserComponent],
  exports: [EllipsisPipe, UserComponent],
})
export class SharedModule {}
