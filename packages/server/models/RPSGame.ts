// models/RPSGame.ts

import { Schema, type } from "@colyseus/schema";

export class RPSGame extends Schema {
  @type("string") player1: string = ""; // Player 1 ID
  @type("string") player2: string = ""; // Player 2 ID
  @type("string") movePlayer1: string | null = null; // Player 1 move
  @type("string") movePlayer2: string | null = null; // Player 2 move
  @type("boolean") completed: boolean = false; // Is the game completed
  @type("string") winner: string | null = null; // Winner ("Player 1", "Player 2", or "draw")
}
