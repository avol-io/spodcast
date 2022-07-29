import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShowService } from '../../services/show.service';

@Component({
  selector: 'shows-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  shows: SpotifyApi.PagingObject<SpotifyApi.SavedShowObject> | undefined;
  constructor(private showService: ShowService, private router: Router, private activeRouter: ActivatedRoute) {}

  ngOnInit(): void {
    this.showService.getShows().subscribe((shows) => (this.shows = shows));
  }

  selectShow(show: SpotifyApi.ShowObjectSimplified) {
    this.router.navigate([show.id], { relativeTo: this.activeRouter });
  }
}
