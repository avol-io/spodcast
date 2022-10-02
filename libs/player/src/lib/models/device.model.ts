import { BaseModel } from '@spoticast/shared';

export class Device extends BaseModel {
  constructor(public dto: SpotifyApi.UserDevice) {
    super();
  }

  get active() {
    return this.dto.is_active;
  }

  get id() {
    return this.dto.id;
  }
  get name() {
    return this.dto.name;
  }

  get type() {
    return this.dto.type;
  }
}
