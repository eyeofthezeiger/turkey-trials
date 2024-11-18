import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

class Player extends Schema {
  @type("number") position: number = 0;
  @type("string") id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }
}

class RedLightGreenLightState extends Schema {
  @type("string") light: string = "Red";
  @type({ map: Player }) players = new MapSchema<Player>();
}

export class RedLightGreenLightRoom extends Room<RedLightGreenLightState> {
  private lightTimer: NodeJS.Timeout | null = null;

  onCreate() {
    this.setState(new RedLightGreenLightState());
    console.log("RedLightGreenLight room created");

    this.onMessage("move", (client) => {
      const player = this.state.players.get(client.sessionId);
      console.log(`[SERVER] Move message received from client: ${client.sessionId}`);
      if (player) {
        console.log(`[SERVER] Player position before move: ${player.position}`);
        console.log(`[SERVER] Current light: ${this.state.light}`);
        if (this.state.light === "Green") {
          player.position += 10;
          console.log(`[SERVER] Player position after move: ${player.position}`);
          this.broadcast("playerMoved", { id: client.sessionId, position: player.position });
          this.checkWin(client);
        } else {
          console.log(`[SERVER] Player moved during Red light. Penalizing.`);
          player.position = 0; // Reset player position
          this.broadcast("playerMoved", { id: client.sessionId, position: player.position });
        }
      } else {
        console.log(`[SERVER] No player found for session: ${client.sessionId}`);
      }
    });

    this.startAutomaticLightSwitch();
  }

  onJoin(client: Client) {
    console.log(`[SERVER] Player joined: ${client.sessionId}`);
    this.state.players.set(client.sessionId, new Player(client.sessionId));
    this.broadcast("playerJoined", { id: client.sessionId });
  }

  onLeave(client: Client) {
    console.log(`[SERVER] Player left: ${client.sessionId}`);
    this.state.players.delete(client.sessionId);
    this.broadcast("playerLeft", { id: client.sessionId });
  }

  startAutomaticLightSwitch() {
    console.log(`[SERVER] Starting light toggle loop.`);
    this.lightTimer = setInterval(() => {
      this.state.light = this.state.light === "Red" ? "Green" : "Red";
      console.log(`[SERVER] Light toggled to: ${this.state.light}`);
      this.broadcast("lightToggled", { light: this.state.light });
    }, Math.random() * 3000 + 2000);
  }

  checkWin(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (player && player.position >= 50) {
      this.broadcast("gameOver", { winner: client.sessionId });
      console.log(`[SERVER] Player ${client.sessionId} won the game.`);
      this.resetGame();
    }
  }

  resetGame() {
    this.state.players.forEach((player) => (player.position = 0));
    this.state.light = "Red";
    this.broadcast("lightToggled", { light: this.state.light });
    console.log("[SERVER] Game reset.");
  }

  onDispose() {
    if (this.lightTimer) clearInterval(this.lightTimer);
    console.log("[SERVER] Room disposed.");
  }
}
