// models/Player.ts

import { Schema, type, ArraySchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") position: number = 0; // Player's position on the track
  @type("string") id: string; // Player ID
  @type("number") puzzlesCompleted: number = 0; // Number of puzzles completed
  @type(["number"]) puzzleTimes: ArraySchema<number> = new ArraySchema<number>(); // Times for completed puzzles
  @type("boolean") inGame: boolean = false; // Is the player currently in a game
  @type("boolean") waiting: boolean = false; // Is the player waiting for a match

  constructor(id: string) {
    super();
    this.id = id;
  }
}
