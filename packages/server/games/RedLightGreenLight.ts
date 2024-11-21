// games/RedLightGreenLight.ts

import { Client } from "colyseus";
import { GameState } from "../models/GameState";
import { Player } from "../models/Player";

export class RedLightGreenLight {
  private state: GameState;
  private broadcast: Function;
  private lightInterval: NodeJS.Timeout | null = null;
  private finishOrder: Player[] = [];
  private gameOver: boolean = false;
  private round: number;

  constructor(state: GameState, broadcast: Function, round: number) {
    this.state = state;
    this.broadcast = broadcast;
    this.round = round;
  }

  startRedLightGreenLight(round: number) {
    this.round = round;
    console.log(`[Server] Starting Red Light, Green Light Round ${this.round}...`);
    this.resetGame();

    // Adjust difficulty based on round
    let intervalTime: number;
    switch (this.round) {
      case 1:
        intervalTime = 3000; // Initial interval
        break;
      case 2:
        intervalTime = 2500; // Increased difficulty
        break;
      case 3:
        intervalTime = 2000; // Highest difficulty
        break;
      default:
        intervalTime = 3000;
    }

    this.toggleLight();
    this.lightInterval = setInterval(() => this.toggleLight(), intervalTime);
  }

  handlePlayerMove(client: Client) {
    if (this.gameOver) return;

    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    if (this.state.light === "Green") {
      player.position += 50;
      player.points += 4;
      console.log(`[Server] Player ${client.sessionId} moved to position ${player.position} and gained 4 points.`);
    } else {
      player.points = Math.max(player.points - 10, 0);
      player.position = 0;
      console.log(`[Server] Player ${client.sessionId} moved on Red Light. Lost 10 points and reset to start.`);
    }

    this.broadcast("player_update", { id: client.sessionId, position: player.position });

    // Broadcast points update
    this.broadcastPointsUpdate();

    // Check if player reached finish line
    if (player.position >= this.state.finishLine && !this.finishOrder.includes(player)) {
      this.finishOrder.push(player);
      console.log(`[Server] Player ${client.sessionId} reached the finish line!`);
      this.broadcast("player_finished", { playerId: client.sessionId, position: this.finishOrder.length });

      // Check if all players have finished
      if (this.finishOrder.length === this.state.players.size) {
        this.endGame();
      }
    }
  }

  endGame() {
    if (this.gameOver) return;

    console.log(`[Server] Ending Red Light, Green Light Round ${this.round}.`);
    this.gameOver = true;
    this.stopLightInterval();

    // Broadcast round over
    this.broadcast("round_over", { round: this.round });

    // Reset game state for potential next round
    this.resetGame();
  }

  private toggleLight() {
    this.state.light = this.state.light === "Red" ? "Green" : "Red";
    console.log(`[Server] Light toggled to: ${this.state.light}`);
    this.broadcast("light_update", { light: this.state.light });
  }

  private resetGame() {
    this.finishOrder = [];
    this.gameOver = false;
    this.state.light = "Red";
    for (const player of this.state.players.values()) {
      player.position = 0;
    }
    this.broadcast("player_update", { id: "all", position: 0 });
  }

  stopLightInterval() {
    if (this.lightInterval) clearInterval(this.lightInterval);
    this.lightInterval = null;
  }

  broadcastPointsUpdate() {
    const points: { [key: string]: number } = {};
    for (const [id, player] of this.state.players.entries()) {
      points[id] = player.points;
    }
    this.broadcast("points_update", { points });
    console.log(`[Server] Broadcasted points_update:`, points);
  }

  handleEndRound() {
    this.endGame();
  }

  handlePlayerLeave(playerId: string) {
    // Handle player leaving during the game if necessary
    const player = this.state.players.get(playerId);
    if (player) {
      if (this.finishOrder.includes(player)) {
        this.finishOrder = this.finishOrder.filter((p) => p.id !== playerId);
      }
      this.broadcast("player_left", { playerId });
    }
  }
}
