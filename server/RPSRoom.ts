// RPSRoom.ts

import { Room, Client } from "colyseus";
import { RPSGame, Move } from "./RPSGame";

export class RPSRoom extends Room {
  private game: RPSGame;
  private players: Client[] = []; // Array to store exactly two players

  constructor() {
    super();
    this.game = new RPSGame();
  }

  onCreate() {
    this.onMessage("move", (client, message: { player: number; move: Move }) => {
      this.game.makeMove(message.player, message.move);
      this.broadcast("state", this.game);
    });

    this.onMessage("reset", () => {
      this.newGame();
    });
  }

  onJoin(client: Client) {
    if (this.players.length >= 2) {
      client.send("error", "Room is full.");
      client.leave(); // Disconnect any additional clients
      return;
    }

    this.players.push(client);
    const playerNumber = this.players.length;

    client.send("playerNumber", playerNumber);
    client.send("state", this.game);
  }

  onLeave(client: Client) {
    this.players = this.players.filter((player) => player !== client);

    // Optionally start a new game if a player leaves
    this.newGame();
  }

  // New game function to reset the game and allow new players to join
  private newGame() {
    this.game.resetGame(); // Reset the game state
    this.players = []; // Clear players, allowing new ones to join
    this.broadcast("state", this.game); // Broadcast the new game state
  }
}
