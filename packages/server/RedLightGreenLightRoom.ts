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
      if (player && this.state.light === "Green") {
        player.position += 10;
        this.broadcast("playerMoved", { id: client.sessionId, position: player.position });
        this.checkWin(client);
      }
    });

    this.startAutomaticLightSwitch();
  }

  onJoin(client: Client) {
    this.state.players.set(client.sessionId, new Player(client.sessionId));
    this.broadcast("playerJoined", { id: client.sessionId });
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    this.broadcast("playerLeft", { id: client.sessionId });
  }

  startAutomaticLightSwitch() {
    this.lightTimer = setInterval(() => {
      this.state.light = this.state.light === "Red" ? "Green" : "Red";
      this.broadcast("lightToggled", { light: this.state.light });
    }, Math.random() * 3000 + 2000);
  }

  checkWin(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (player && player.position >= 500) {
      this.broadcast("gameOver", { winner: client.sessionId });
      this.resetGame();
    }
  }

  resetGame() {
    this.state.players.forEach((player) => (player.position = 0));
    this.state.light = "Red";
    this.broadcast("lightToggled", { light: this.state.light });
  }

  onDispose() {
    if (this.lightTimer) clearInterval(this.lightTimer);
  }
}
