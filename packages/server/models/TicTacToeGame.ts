// models/TicTacToeGame.ts

import { Schema, type, ArraySchema } from "@colyseus/schema";

export class TicTacToeGame extends Schema {
  @type(["string"]) board: ArraySchema<string> = new ArraySchema(...Array(9).fill(""));
  @type("string") currentTurn: string = "X";
  @type("string") playerX: string = "";
  @type("string") playerO: string = "";
  @type("boolean") completed: boolean = false;
}
