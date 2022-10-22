import { PlaylistEpisode } from './playlist-episode.model';

export interface PlaylistModel {
  id: string;
  snapshot_id: string;
  tracks: PlaylistEpisode[];
  nextTrack?: string | null;
  uri: string;
}
