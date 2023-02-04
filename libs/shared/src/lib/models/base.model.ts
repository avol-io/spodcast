export class BaseModel {
  public updateDate;

  constructor() {
    this.updateDate = new Date().getTime();
  }

  setUpdated() {
    this.updateDate = new Date().getTime();
  }
}
