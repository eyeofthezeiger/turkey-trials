// RedLightGreenLightRoom.ts

import { Room, Client } from "colyseus";
import { Schema, MapSchema } from "@colyseus/schema";

class Player extends Schema {
  position: number;

  constructor() {
    super();
    this.position = 0; // Start at position 0
  }
}

class State extends Schema {
  light: string;
  players: MapSchema<Player>;
  automatic: boolean;

  constructor() {
    super();
    this.light = "Red"; // Initial light status is "Red"
    this.players = new MapSchema<Player>();
    this.automatic = false; // Default to manual mode
  }
}

export class RedLightGreenLightRoom extends Room<State> {
  private lightTimer: NodeJS.Timeout | null = null;

  onCreate() {
    this.setState(new State());

    this.onMessage("move", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player && this.state.light === "Green") {
        player.position += 10; // Move player 10 units to the right
        this.checkWin(client);
      }
    });

    this.onMessage("toggleLight", () => {
      this.toggleLight();
    });

    this.onMessage("setAutomatic", (_, isAutomatic: boolean) => {
      this.state.automatic = isAutomatic;
      if (isAutomatic) {
        console.log("Automatic mode enabled");
        this.startAutomaticLightSwitch();
      } else {
        console.log("Automatic mode disabled");
        this.stopAutomaticLightSwitch();
      }
    });
  }

  onJoin(client: Client) {
    this.state.players.set(client.sessionId, new Player());
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }

  toggleLight() {
    this.state.light = this.state.light === "Red" ? "Green" : "Red";
    this.broadcast("light", { light: this.state.light });
    console.log(`Light toggled to ${this.state.light}`);
  }

  startAutomaticLightSwitch() {
    this.stopAutomaticLightSwitch(); // Ensure only one interval is running
    this.lightTimer = setInterval(() => {
      this.toggleLight();
    }, Math.random() * 3000 + 2000); // Toggle every 2-5 seconds
  }

  stopAutomaticLightSwitch() {
    if (this.lightTimer) {
      clearInterval(this.lightTimer);
      this.lightTimer = null;
    }
  }

  checkWin(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (player && player.position >= 100) { // Win condition: position >= 100
      this.broadcast("winner", { winner: client.sessionId });
      console.log(`Player ${client.sessionId} wins!`);
      this.resetGame();
    }
  }

  resetGame() {
    console.log("Resetting game state");
    this.state.players.forEach((player) => (player.position = 0));
    this.state.light = "Red";
    this.broadcast("light", { light: this.state.light });
  }
}
