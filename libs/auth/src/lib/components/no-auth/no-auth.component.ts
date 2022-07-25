import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  templateUrl: './no-auth.component.html',
  styleUrls: ['./no-auth.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NoAuthComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
