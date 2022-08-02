export interface PlaylistModel {
  id: string;
  snapshot_id: string;
  tracks: SpotifyApi.TrackObjectFull[];
  nextTrack?: string | null;
}
