export enum EVENT_TYPE {
  /**
   * Return the list of shows in the payload
   */
  SHOWS_LOAD_LIST,
  SHOW_LOAD_DETAIL, //payload idShow

  /**
   * Add the show in the payload to the followed shows
   */
  SHOW_ADD,
  /**
   * Remove show in the payload from the followed shows
   */
  SHOW_REMOVE,
  /**
   * In the payload will find the key to search
   */
  SHOWS_SEARCH,
  /**
   * In the payload the result of search
   */
  SHOWS_SEARCH_RESULT,
  /**
   * Add episode to playlist
   */
  EPISODE_ADD,

  /**
   * Load the next episodes
   */
  EPISODE_NEXT_LOAD,
  /**
   * Remove episode from playlist
   */
  EPISODE_REMOVE,
  /**
   * Move episode
   */
  EPISODE_MOVE,
  /**
   * Reproduce an episode
   */
  EPISODE_PLAY,
  /**
   * Set to reproduce an episode
   */
  EPISODE_HIGHLIGHT,

  PLAYER_PLAY,
  PLAYER_PAUSE,
  PLAYER_FORWARD,
  PLAYER_BACKWARD,
  PLAYER_NEXT,
  PLAYER_PREVIOUS,
  PLAYER_UPDATE_INFO,
  PLAYER_CHANGE_DEVICE,
  PLAYER_DEVICE_LIST,
  PLAYLIST_LOAD,
  PLAYLIST_REFRESH,
  PLAYLIST_CREATE,
}
