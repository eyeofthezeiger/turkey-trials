// SlidingPuzzleRoom.ts

import { Room, Client } from "colyseus";

interface PlayerData {
  startTime: number;
  endTime?: number;
}

export class SlidingPuzzleRoom extends Room {
  private players: Map<string, PlayerData> = new Map();

  onCreate() {
    this.onMessage("startPuzzle", (client) => {
      this.players.set(client.sessionId, { startTime: Date.now() });
      client.send("puzzleStarted", { message: "Puzzle started!" });
    });

    this.onMessage("completePuzzle", (client) => {
      const playerData = this.players.get(client.sessionId);

      if (playerData) {
        playerData.endTime = Date.now();
        const completionTime = playerData.endTime - playerData.startTime;

        // Send the completion time back to the client
        client.send("puzzleCompleted", { completionTime });
        console.log("Sent puzzleCompleted with completionTime:", completionTime);
      }
    });
  }

  onJoin(client: Client) {
    client.send("welcome", { message: "Welcome to the Sliding Block Puzzle!" });
  }

  onLeave(client: Client) {
    this.players.delete(client.sessionId); // Remove player data on leave
  }
}
