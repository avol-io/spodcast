import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'listened',
})
export class ListenedPipe implements PipeTransform {
  transform(dto: SpotifyApi.EpisodeObjectSimplified, ...args: unknown[]): unknown {
    if (!dto) {
      return dto;
    }
    return dto.resume_point?.fully_played
      ? 100
      : Math.round(((dto.resume_point?.resume_position_ms || 0) / dto.duration_ms) * 100);
  }
}
