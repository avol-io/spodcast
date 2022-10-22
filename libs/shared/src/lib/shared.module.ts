import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccordionComponent } from './components/accordion/accordion.component';
import { UserComponent } from './components/user/user.component';
import { EllipsisPipe } from './pipes/ellipsis/ellipsis.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [EllipsisPipe, UserComponent, AccordionComponent],
  exports: [EllipsisPipe, UserComponent, AccordionComponent],
})
export class SharedModule {}
