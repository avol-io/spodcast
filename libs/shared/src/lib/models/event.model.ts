import { EVENT_TYPE } from '../constants/event-type.const';

export interface SpoticastEvent<PayloadType> {
  type: EVENT_TYPE;
  payload?: PayloadType;
  cached?: boolean;
}
