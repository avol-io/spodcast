export class EpisodeModel {
  //use of adapter pattern
  private dto: SpotifyApi.EpisodeObjectSimplified;

  listened;
  added = false;

  constructor(dto: SpotifyApi.EpisodeObjectSimplified) {
    this.dto = dto;

    this.listened = dto.resume_point?.fully_played
      ? 100
      : Math.round(((dto.resume_point?.resume_position_ms || 0) / dto.duration_ms) * 100);
  }

  getDto() {
    return this.dto;
  }

  /**
   *
   *  Adapter methods
   *
   */
  get id() {
    return this.dto.id;
  }

  get uri() {
    return this.dto.uri;
  }
  get name() {
    return this.dto.name;
  }

  get releaseDate() {
    return this.dto.release_date;
  }

  get description() {
    return this.dto.description;
  }
}
