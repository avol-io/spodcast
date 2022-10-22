import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'spoticast-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AccordionComponent {
  @Input()
  title = 'No title';

  open = false;

  toggle() {
    this.open = !this.open;
  }
}
