// models/Player.ts

import { Schema, type, ArraySchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") position: number = 0; // Player's position on the track
  @type("string") id: string; // Player ID
  @type("number") puzzlesCompleted: number = 0; // Number of puzzles completed
  @type("number") points: number = 0; // Player's total points

  constructor(id: string) {
    super();
    this.id = id;
  }
}
