// TicTacToeRoom.ts

import { Room, Client } from "colyseus";
import { TicTacToeGame } from "./GameState";

export class TicTacToeRoom extends Room {
  private game: TicTacToeGame;

  constructor() {
    super();
    this.game = new TicTacToeGame(); // Initialize the game here
  }

  onCreate() {
    // The game has already been initialized in the constructor
    this.onMessage("move", (client, { index }) => {
      if (this.game.makeMove(index)) {
        // Broadcast the updated game state to all clients
        this.broadcast("state", this.game);
      }
    });

    this.onMessage("reset", () => {
      this.game.resetGame();
      this.broadcast("state", this.game);
    });
  }

  onJoin(client: Client) {
    // Send the initial game state to the newly joined player
    client.send("state", this.game);
  }
}
