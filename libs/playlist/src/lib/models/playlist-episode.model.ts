export interface PlaylistEpisode {
  id: string;
  uri: string;
  duration_ms: number;
  is_playable?: boolean | undefined;

  //full

  description: string;
  html_description: string;
  images: string;
  name: string;
  release_date: string;
  resume_point: number; //-1 full
}
