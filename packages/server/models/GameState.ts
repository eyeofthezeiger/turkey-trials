// models/GameState.ts

import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { Player } from "./Player";
import { TicTacToeGame } from "./TicTacToeGame";
import { RPSGame } from "./RPSGame";

export class GameState extends Schema {
  @type("string") currentGame: string = "welcome"; // Current game state
  @type({ map: Player }) players: MapSchema<Player> = new MapSchema<Player>(); // Players in the game
  @type("string") light: string = "Red"; // Red or Green Light for RLGL
  @type("number") finishLine: number = 500; // Finish line for RLGL
  @type("string") currentImage: string = ""; // Current sliding puzzle image
  @type("number") remainingTime: number = 300000; // 5 minutes in milliseconds
  @type("boolean") timerRunning: boolean = false; // Whether the game timer is running
  @type([TicTacToeGame]) ticTacToeGames: ArraySchema<TicTacToeGame> = new ArraySchema<TicTacToeGame>();
  @type([RPSGame]) rpsGames: ArraySchema<RPSGame> = new ArraySchema<RPSGame>(); // Rock Paper Scissors games
}
