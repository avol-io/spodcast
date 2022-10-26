import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BaseComponent,
  Episode,
  EventService,
  EVENT_TYPE as SpotiEventType,
  Show,
  SpoticastStoreService,
} from '@spoticast/shared';
import { Subscription } from 'rxjs';

@Component({
  selector: 'shows-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowComponent extends BaseComponent implements OnInit {
  show: Show | undefined; //SpotifyApi.ShowObject
  subscriptionToShow: Subscription | undefined;
  constructor(
    private activeRoute: ActivatedRoute,
    private events: EventService,
    private store: SpoticastStoreService,
    private di: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.destroyForMe = this.activeRoute.params.subscribe((par) => {
      this.events.notifyEvent({ type: SpotiEventType.SHOW_LOAD_DETAIL, payload: par['idShow'] });
      if (this.subscriptionToShow && !this.subscriptionToShow.closed) {
        this.subscriptionToShow.unsubscribe();
      }
      this.destroyForMe = this.subscriptionToShow = this.store.get('shows', par['idShow']).subscribe((show) => {
        this.show = show;
      });
    });
  }

  identifyEpisode(index: number, item: Episode) {
    return item.id;
  }

  loadNext() {
    this.events.notifyEvent({ type: SpotiEventType.EPISODE_NEXT_LOAD, payload: this.show });
  }

  addToPlaylist(e: Episode, position: number | undefined = undefined) {
    this.events.notifyEvent({ type: SpotiEventType.EPISODE_ADD, payload: { episode: e, position: position } });
  }
}
