import { Episode } from './episode.model';

export interface PlaylistModel {
  id: string;
  snapshot_id: string;
  episodes: Episode[];
  next?: string | null;
  uri: string;
}
