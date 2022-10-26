import { Component, DoCheck, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  template: ` <p>base works!</p> `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class BaseComponent implements OnDestroy, DoCheck {
  private subscriptions: Subscription[] = [];
  ngDoCheck() {
    console.warn('Lifecycle round');
  }

  set destroyForMe(sub: Subscription) {
    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => {
      if (s && !s.closed) {
        s.unsubscribe();
      }
    });
  }
}
