export const SPOTIFY_CONF = {
  CLIENT_ID: 'c3b973e238c64937921eb050c4d57d28',
  SECRET: '867cc31befa345dcbd1178c6b8e51603',
  CALLBACK: `/post-auth`,
  PLAYLIST_spoticast: 'spoticast',
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
    PLAYLISTS_BY_USER: 'https://api.spotify.com/v1/me/playlists',
    PLAYLIST_GET: 'https://api.spotify.com/v1/playlists/:ID',
    PLAYLIST_CREATE: 'https://api.spotify.com/v1/users/:ID_USER/playlists',
    PLAYLIST_GET_TRACKS: 'https://api.spotify.com/v1/playlists/:ID/tracks',
    GET_DEVICES: 'https://api.spotify.com/v1/me/player/devices',
    PLAY: 'https://api.spotify.com/v1/me/player/play',
    NEXT: 'https://api.spotify.com/v1/me/player/next',
    PREVIOUS: 'https://api.spotify.com/v1/me/player/previous',
    SEEK: 'https://api.spotify.com/v1/me/player/seek',
    EPISODES: 'https://api.spotify.com/v1/episodes',
  },
};
