import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from '@spodcast/playlist';
import { Subscription } from 'rxjs';
import { ShowService } from '../../services/show.service';

@Component({
  selector: 'shows-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowComponent implements OnInit {
  subscriptions: Subscription[] = [];
  idShow: string | undefined;
  show: SpotifyApi.ShowObject | undefined;
  idPlaylist = 'NO CHECK';
  constructor(
    private activeRoute: ActivatedRoute,
    private showService: ShowService,
    private di: ChangeDetectorRef,
    private playlistService: PlaylistService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.activeRoute.params.subscribe((par) => {
        this.loadShowInfo(par['idShow']);
      })
    );
  }

  loadShowInfo(idShow: string) {
    this.idShow = idShow;
    this.subscriptions.push(
      this.showService.getShow(idShow).subscribe((show) => {
        this.show = show;
        this.di.markForCheck();
      })
    );
  }

  ngDestroy() {
    this.subscriptions.forEach((s) => {
      if (s && !s.closed) {
        s.unsubscribe();
      }
    });
  }

  identifyEpisode(index: number, item: SpotifyApi.EpisodeObjectSimplified) {
    return item.id;
  }

  loadNext(next: string) {
    this.subscriptions.push(
      this.showService.getNextEpisodes(next).subscribe((episodes) => {
        if (this.show) {
          this.show?.episodes.items.push(...episodes.items);
          this.show.episodes.next = episodes.next;
          this.di.markForCheck();
        }
      })
    );
  }

  addToPlaylist(e: any, position: number | undefined = undefined) {
    console.log(e.uri, position);
    this.playlistService.addEpisode(e.uri, position).subscribe(() => {
      alert('addded');
    });
  }
}
