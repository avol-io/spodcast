import { BaseModel } from './base.model';

export class Episode extends BaseModel {
  protected dto: SpotifyApi.EpisodeObjectSimplified;
  listened;

  constructor(dto: SpotifyApi.EpisodeObjectSimplified) {
    super();
    this.dto = dto;
    this.listened = dto.resume_point?.fully_played
      ? 100
      : Math.round(((dto.resume_point?.resume_position_ms || 0) / dto.duration_ms) * 100);
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

  get resumeTime() {
    return this.dto.resume_point?.resume_position_ms;
  }
}
