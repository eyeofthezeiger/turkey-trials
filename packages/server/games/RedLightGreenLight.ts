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

  

  constructor(state: GameState, broadcast: Function) {
    this.state = state;
    this.broadcast = broadcast;
  }

  startRedLightGreenLight() {
    console.log("[Server] Starting Red Light, Green Light...");
    this.resetGame();
    this.toggleLight();
    this.lightInterval = setInterval(() => this.toggleLight(), Math.random() * 3000 + 2000); // Random interval
  }

  handlePlayerMove(client: Client) {
    if (this.gameOver) return;

    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    if (this.state.light === "Green") {
      player.position += 50;
      console.log(`[Server] Player ${client.sessionId} moved to position ${player.position}`);
      this.checkFinishLine(client, player);
    } else {
      player.position = 0; // Reset position on Red Light
      console.log(`[Server] Player ${client.sessionId} moved on Red Light. Reset to start.`);
    }

    this.broadcast("player_update", { id: client.sessionId, position: player.position });
  }

  private toggleLight() {
    this.state.light = this.state.light === "Red" ? "Green" : "Red";
    console.log(`[Server] Light toggled to: ${this.state.light}`);
    this.broadcast("light_update", { light: this.state.light });
  }

  private checkFinishLine(client: Client, player: Player) {
    if (player.position >= this.state.finishLine && !this.finishOrder.includes(player)) {
      this.finishOrder.push(player);
      console.log(`[Server] Player ${client.sessionId} reached the finish line!`);
      this.broadcast("player_finished", { playerId: client.sessionId, position: this.finishOrder.length });

      if (this.finishOrder.length >= 3 || this.finishOrder.length === this.state.players.size) {
        this.endGame();
      }
    }
  }

  private endGame() {
    console.log("[Server] Ending Red Light, Green Light game.");
    this.gameOver = true;
    this.stopLightInterval();

    // Award points based on finishing positions
    for (let i = 0; i < this.finishOrder.length; i++) {
      const player = this.finishOrder[i];
      if (i === 0) {
        player.points += 10;
      } else if (i === 1) {
        player.points += 8;
      } else if (i === 2) {
        player.points += 6;
      } else {
        player.points += 4;
      }
    }

    // Award participation points to those who didn't finish
    for (const [id, player] of this.state.players.entries()) {
      if (!this.finishOrder.includes(player)) {
        player.points += 2;
      }
    }

    // Broadcast updated points
    this.broadcastPointsUpdate();

    // Notify clients that the game is over
    this.broadcast("game_over", {});

    // Reset game state
    this.resetGame();
  }

  private resetGame() {
    this.finishOrder = [];
    this.gameOver = false;
    this.state.light = "Red";
    for (const player of this.state.players.values()) {
      player.position = 0;
    }
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
