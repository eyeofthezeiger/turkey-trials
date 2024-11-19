// games/RedLightGreenLightLogic.ts

import { Client } from "colyseus";
import { GameState } from "../models/GameState";
import { Player } from "../models/Player";

export class RedLightGreenLight {
  private state: GameState;
  private broadcast: Function;
  private lightInterval: NodeJS.Timeout | null = null;

  constructor(state: GameState, broadcast: Function) {
    this.state = state;
    this.broadcast = broadcast;
  }

  startRedLightGreenLight() {
    console.log("[Server] Starting Red Light, Green Light...");
    this.toggleLight();
    this.lightInterval = setInterval(() => this.toggleLight(), Math.random() * 3000 + 2000); // Random interval
  }

  handlePlayerMove(client: Client) {
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
    if (player.position >= this.state.finishLine) {
      console.log(`[Server] Player ${client.sessionId} reached the finish line!`);
      this.broadcast("game_over", { winner: client.sessionId });
      this.stopLightInterval();
    }
  }

  stopLightInterval() {
    if (this.lightInterval) clearInterval(this.lightInterval);
    this.lightInterval = null;
  }
}
