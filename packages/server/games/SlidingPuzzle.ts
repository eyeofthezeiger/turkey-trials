// games/SlidingPuzzleLogic.ts

import { Client } from "colyseus";
import { GameState } from "../models/GameState";
import { Player } from "../models/Player";

export class SlidingPuzzle {
  private state: GameState;
  private broadcast: Function;
  private gameTimer: NodeJS.Timeout | null = null;

  constructor(state: GameState, broadcast: Function) {
    this.state = state;
    this.broadcast = broadcast;
  }

  startSlidingPuzzle() {
    console.log("[Server] Starting Sliding Puzzle...");
    this.assignNewPuzzle();
    this.startGameTimer();
  }

  handlePuzzleCompletion(client: Client, puzzleTime: number) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    player.puzzlesCompleted += 1;
    player.puzzleTimes.push(puzzleTime);

    console.log(
      `[Server] Player ${client.sessionId} completed a puzzle. Total completed: ${player.puzzlesCompleted}`
    );

    // Assign a new puzzle image
    this.assignNewPuzzle();
    this.broadcast("puzzle_completed", {
      playerId: client.sessionId,
      puzzlesCompleted: player.puzzlesCompleted,
      puzzleTimes: player.puzzleTimes,
      newImage: this.state.currentImage,
    });
  }

  private assignNewPuzzle() {
    const images = ["pet1", "pet2", "pet3", "pet4", "pet5", "pet6", "pet7"];
    this.state.currentImage = images[Math.floor(Math.random() * images.length)];
    console.log(`[Server] Assigned new puzzle image: ${this.state.currentImage}`);
    this.broadcast("new_puzzle", { image: this.state.currentImage });
  }

  private startGameTimer() {
    this.state.timerRunning = true;
    this.state.remainingTime = 300000; // Reset to 5 minutes

    this.gameTimer = setInterval(() => {
      this.state.remainingTime -= 1000;

      if (this.state.remainingTime <= 0) {
        console.log("[Server] Time's up!");
        this.stopTimer();
        this.broadcast("game_over");
      } else {
        this.broadcast("timer_update", { remainingTime: this.state.remainingTime });
      }
    }, 1000);
  }

  stopTimer() {
    if (this.gameTimer) clearInterval(this.gameTimer);
    this.gameTimer = null;
    this.state.timerRunning = false;
  }
}
