import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccordionComponent } from './components/accordion/accordion.component';
import { UserComponent } from './components/user/user.component';
import { EllipsisPipe } from './pipes/ellipsis/ellipsis.pipe';
import { BaseComponent } from './components/base/base.component';

@NgModule({
  imports: [CommonModule],
  declarations: [EllipsisPipe, UserComponent, AccordionComponent, BaseComponent],
  exports: [EllipsisPipe, UserComponent, AccordionComponent],
})
export class SharedModule {}
