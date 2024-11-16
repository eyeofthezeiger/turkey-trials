import { Schema, type } from "@colyseus/schema";

class GameRoomState extends Schema {
  @type("string") winnerId: string;
}

export { GameRoomState };
