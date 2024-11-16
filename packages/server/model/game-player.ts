import { Schema, type } from "@colyseus/schema";

class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("string") color: string;
}

export { Player };
