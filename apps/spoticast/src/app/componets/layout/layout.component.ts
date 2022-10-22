import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LayoutComponent implements OnInit {
  constructor() {
    //
  }

  ngOnInit(): void {
    const a = 1;
  }
}
