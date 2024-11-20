// models/GameState.ts

import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from "./Player";

export class GameState extends Schema {
  @type("string") currentGame: string = "welcome"; // Current game state
  @type({ map: Player }) players: MapSchema<Player> = new MapSchema<Player>(); // Players in the game
  @type("string") light: string = "Red"; // Red or Green Light for RLGL
  @type("number") finishLine: number = 500; // Finish line for RLGL
  @type("string") currentImage: string = ""; // Current sliding puzzle image
  @type("number") remainingTime: number = 300; // 5 minutes in seconds
  @type("boolean") timerRunning: boolean = false; // Whether the game timer is running
}
