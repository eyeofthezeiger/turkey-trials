import { Schema, type, MapSchema } from "@colyseus/schema";

class Player extends Schema {
  @type("number") position: number = 0;
  @type("string") id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }
}

class RedLightGreenLightState extends Schema {
  @type("string") light: string = "Red";
  @type({ map: Player }) players = new MapSchema<Player>();
}

export { RedLightGreenLightState, Player };
