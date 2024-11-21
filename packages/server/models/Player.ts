// models/Player.ts

import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") id: string; // Player ID
  @type("string") name: string = "Anonymous"; // Player's name
  @type("string") color: string = "#000000"; // Player's color in HEX
  @type("number") position: number = 0; // Player's position on the track
  @type("number") puzzlesCompleted: number = 0; // Number of puzzles completed
  @type("number") points: number = 0; // Player's total points
  @type("boolean") hasFinished: boolean; // New flag


  constructor(id: string) {
    super();
    this.id = id;
    this.hasFinished = false; // Initialize as false
  }
}
