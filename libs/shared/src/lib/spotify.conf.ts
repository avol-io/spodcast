export const SPOTIFY_CONF = {
  CLIENT_ID: 'c3b973e238c64937921eb050c4d57d28',
  SECRET: '867cc31befa345dcbd1178c6b8e51603',
  CALLBACK: `/post-auth`,
  PLAYLIST_SPODCAST: 'Spodcast',
  SCOPES: [
    //Listening History
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-position',
    // //Spotify Connect
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    // //Playback - For SDK Playback //https://developer.spotify.com/documentation/web-playback-sdk/quick-start/
    'streaming',
    // //Playlists
    'playlist-modify-public',
    'playlist-modify-private',
    'playlist-read-private',
    'playlist-read-collaborative',
    // //Library
    'user-library-modify',
    'user-library-read',
    //Users - For SDK Playback //https://developer.spotify.com/documentation/web-playback-sdk/quick-start/
    'user-read-email',
    'user-read-private',
  ],
  API: {
    AUTHORIZE_URL: 'https://accounts.spotify.com/authorize',
    ACCESS_TOKEN_URL: 'https://accounts.spotify.com/api/token',
    ME: 'https://api.spotify.com/v1/me',
    SHOWS: 'https://api.spotify.com/v1/me/shows',
    SHOW_DETAIL: 'https://api.spotify.com/v1/shows/:ID_SHOW',
    PLAYLIST: 'https://api.spotify.com/v1/me/playlists',
    PLAYLIST_CREATE: 'https://developer.spotify.com/web-api/create-playlist/',
  },
};
