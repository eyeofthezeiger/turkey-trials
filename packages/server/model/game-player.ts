import { Schema, type } from "@colyseus/schema";

class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("string") color: string;

  constructor(_id: string, _name: string, _color: string) {
    super();
    this.id = _id;
    this.name = _color;
    this.color = _color;
  }
}

export { Player };
