import { BaseModel } from './base.model';
import { Episode } from './episode.model';

export class Show extends BaseModel {
  id = 'no_id';
  uri = 'no_uri';
  episodes: Episode[] = [];
  name = 'No name';
  description = 'No description';
  cover = './assets/no_cover.png';
  nextEpisodeURL: string | null = null;
}
