export class BaseModel {
  creationDate;

  constructor() {
    this.creationDate = new Date().getTime();
  }
}
