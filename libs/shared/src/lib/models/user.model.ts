import { BaseModel } from './base.model';

export class User extends BaseModel {
  constructor(public dto: SpotifyApi.UserObjectPublic) {
    super();
  }

  get id() {
    return this.dto.id || 'no_user_id';
  }
}
