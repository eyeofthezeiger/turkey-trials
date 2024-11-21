// games/SlidingPuzzle.ts

import { Client } from "colyseus";
import { GameState } from "../models/GameState";
import { Player } from "../models/Player";

export class SlidingPuzzle {
  private state: GameState;
  private broadcast: Function;
  private timer: NodeJS.Timeout | null = null;
  private timeRemaining: number; // in seconds
  private roundOver: boolean = false;

  constructor(state: GameState, broadcast: Function) {
    this.state = state;
    this.broadcast = broadcast;
    this.timeRemaining = 600; // 10 minutes in seconds
  }

  startSlidingPuzzle() {
    console.log("[Server] Sliding Puzzle started.");
    this.roundOver = false;
    this.timeRemaining = 600; // Reset to 10 minutes

    // Broadcast that the Sliding Puzzle has started
    this.broadcast("game_changed", "sliding_puzzle");

    // Start the countdown timer
    this.timer = setInterval(() => this.tick(), 1000);
    this.broadcastTimerUpdate();

    // Notify all clients to start the timer
    this.broadcast("timer_started", { timeRemaining: this.timeRemaining });
  }

  tick() {
    if (this.roundOver) return;

    this.timeRemaining -= 1;
    this.broadcastTimerUpdate();

    if (this.timeRemaining <= 0) {
      this.endRound();
    }
  }

  broadcastTimerUpdate() {
    this.broadcast("timer_update", { timeRemaining: this.timeRemaining });
  }

  handlePuzzleCompletion(client: Client, puzzleTime: number) {
    const player = this.state.players.get(client.sessionId);
    if (!player || this.roundOver) return;

    player.puzzlesCompleted += 1;

    console.log(
      `[Server] Player ${client.sessionId} completed a puzzle. Total completed: ${player.puzzlesCompleted}`
    );

    // Award points
    player.points += 25;

    // Check if player has completed all puzzles
    if (player.puzzlesCompleted === 7) {
      player.points += 500; // Bonus points
      console.log(`[Server] Player ${client.sessionId} has completed all puzzles.`);
      // Optionally, handle player-specific end (e.g., mark as finished)
    }

    // Broadcast updated points
    this.broadcastPointsUpdate();
  }

  endRound() {
    if (this.roundOver) return;

    this.roundOver = true;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    console.log("[Server] Sliding Puzzle round ended.");
    this.broadcast("round_over", { timeRemaining: this.timeRemaining });

    // Determine game winner based on points
    this.determineGameWinner();
  }

  determineGameWinner() {
    const sortedPlayers = Array.from(this.state.players.values()).sort(
      (a, b) => b.points - a.points
    );
    const winner = sortedPlayers[0];
    const totalPoints = winner ? winner.points : 0;

    // Broadcast game winner details
    this.broadcast("game_over", {
      winnerName: winner ? winner.name : "No Winner",
      totalPoints: totalPoints,
    });

    console.log(`[Server] Game Over. Winner: ${winner ? winner.name : "No Winner"} with ${totalPoints} points.`);
  }

  broadcastPointsUpdate() {
    const points: { [key: string]: number } = {};
    for (const [id, player] of this.state.players.entries()) {
      points[id] = player.points;
    }
    this.broadcast("points_update", { points });
    console.log(`[Server] Broadcasted points_update:`, points);
  }

  handleEndRoundRequest() {
    this.endRound();
  }

  resetSlidingPuzzle() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.roundOver = false;
    this.timeRemaining = 600; // Reset to 10 minutes
  }
}
