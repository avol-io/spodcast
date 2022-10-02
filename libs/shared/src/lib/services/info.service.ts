/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { filter, Observable, Subject, tap } from 'rxjs';
import { SpoticastEvent } from '../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private bus: Subject<SpoticastEvent<any>> = new Subject<SpoticastEvent<any>>();

  notifyMe(type: string[]) {
    return this.bus.asObservable().pipe(
      filter((event) => {
        if (!type) {
          return true;
        }
        return type.includes(event.type);
      })
    );
  }

  notify(event: SpoticastEvent<any>) {
    this.bus.next(event);
  }

  notifyCached<MODEL>(eventCached: SpoticastEvent<MODEL>, obsNewData: Observable<MODEL>) {
    this.notify(eventCached);
    return obsNewData.pipe(
      tap((newData) => {
        const newEvent = {
          type: eventCached.type,
          eventCached: false,
          payload: newData,
        };
        this.notify(newEvent);
      })
    );
  }
}
