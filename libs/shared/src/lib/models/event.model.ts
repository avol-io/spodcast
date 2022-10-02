export interface SpoticastEvent<PayloadType> {
  type: string;
  payload?: PayloadType;
  cached?: boolean;
}
