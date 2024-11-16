import { MapSchema, type } from "@colyseus/schema";

import { GameRoomState } from "./game-room";

class RedLightGreenLightState extends GameRoomState {
  @type({ map: "number" }) positions = new MapSchema<number>();
}

export { RedLightGreenLightState };
