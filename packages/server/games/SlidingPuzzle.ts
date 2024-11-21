// games/SlidingPuzzle.ts

import { Client } from "colyseus";
import { GameState } from "../models/GameState";
import { Player } from "../models/Player";

export class SlidingPuzzle {
  private state: GameState;
  private broadcast: Function;

  constructor(state: GameState, broadcast: Function) {
    this.state = state;
    this.broadcast = broadcast;
  }

  startSlidingPuzzle() {
    console.log("[Server] Sliding Puzzle started.");
    // No need to assign puzzles; client handles image shuffling and puzzle assignment
  }

  handlePuzzleCompletion(client: Client, puzzleTime: number) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    player.puzzlesCompleted += 1;

    console.log(
      `[Server] Player ${client.sessionId} completed a puzzle. Total completed: ${player.puzzlesCompleted}`
    );

    // Award points
    player.points += 25;

    // Check if all puzzles are completed
    if (player.puzzlesCompleted === 7) {
      player.points += 500; // Bonus points
      this.broadcast("game_over", { playerId: client.sessionId });
      console.log(`[Server] Player ${client.sessionId} has completed all puzzles.`);
    }

    // Broadcast updated points
    this.broadcastPointsUpdate();
  }

  broadcastPointsUpdate() {
    const points: { [key: string]: number } = {};
    for (const [id, player] of this.state.players.entries()) {
      points[id] = player.points;
    }
    this.broadcast("points_update", { points });
    console.log(`[Server] Broadcasted points_update:`, points);
  }
}
