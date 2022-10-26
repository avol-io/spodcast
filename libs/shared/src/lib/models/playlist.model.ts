import { Episode } from '@spoticast/shared';

export interface PlaylistModel {
  id: string;
  snapshot_id: string;
  tracks: Episode[];
  next?: string | null;
  uri: string;
}
