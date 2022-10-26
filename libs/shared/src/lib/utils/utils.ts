export function getBestImage(dto: SpotifyApi.ImageObject[]) {
  let best: SpotifyApi.ImageObject = dto[0];
  dto.forEach((next) => {
    if (next.width && best.width && next.width > best.width) {
      best = next;
    }
  });
  return best;
}
