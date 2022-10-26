import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent, EventService, EVENT_TYPE, Show, SpoticastStoreService } from '@spoticast/shared';

@Component({
  selector: 'shows-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryComponent extends BaseComponent implements OnInit {
  shows: Show[] = [];

  constructor(
    private events: EventService,
    private store: SpoticastStoreService,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private di: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.destroyForMe = this.store.get('shows').subscribe((shows) => {
      this.shows = [];
      Object.keys(shows).forEach((key) => {
        this.shows?.push(shows[key]);
      });
      this.shows.sort((a, b) => {
        return a.episodes[0].releaseDate < b.episodes[0].releaseDate ? -1 : 1;
      });
      this.di.markForCheck();
    });
    this.refreshShows();
  }

  refreshShows() {
    this.events.notifyEvent({ type: EVENT_TYPE.SHOWS_LOAD_LIST, payload: { page: 1 } });
  }

  selectShow(show: Show) {
    this.router.navigate([show.id], { relativeTo: this.activeRouter });
  }
}
