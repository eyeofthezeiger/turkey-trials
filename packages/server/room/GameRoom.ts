import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

class Player extends Schema {
  @type("number") position: number = 0; // Player's position on the track
  @type("string") id: string; // Player ID

  constructor(id: string) {
    super();
    this.id = id;
  }
}

class GameState extends Schema {
  @type("string") currentGame: string = "welcome";
  @type({ map: Player }) players: MapSchema<Player> = new MapSchema<Player>();
  @type("string") light: string = "Red"; // Red or Green Light
  @type("number") finishLine: number = 500; // Finish line position
}

export class GameRoom extends Room<GameState> {
  private lightInterval: NodeJS.Timeout | null = null;

  onCreate() {
    this.setState(new GameState());
    console.log(`[Server] Room created. Initial game state: ${this.state.currentGame}`);

    // Handle game state changes
    this.onMessage("change_game", (client, newGame: string) => {
      console.log(`[Server] Received game change request: ${newGame} from ${client.sessionId}`);
      this.state.currentGame = newGame;
      this.broadcast("game_changed", newGame);

      if (newGame === "game1") {
        this.startRedLightGreenLight();
      } else {
        this.stopRedLightGreenLight();
      }
    });

    // Handle player movements for Red Light, Green Light
    this.onMessage("rlgl_move", (client) => {
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
    });

    // Handle player joining lobby
    this.onMessage("join_lobby", (client) => {
      console.log(`[Server] Client ${client.sessionId} requested to join the lobby.`);
      if (!this.state.players.has(client.sessionId)) {
        this.state.players.set(client.sessionId, new Player(client.sessionId));
        console.log(`[Server] Client ${client.sessionId} added to lobby.`);
        this.broadcast("player_joined", { playerId: client.sessionId });
      }
      this.logPlayers();
    });

    // Handle player leaving lobby
    this.onMessage("leave_lobby", (client) => {
      console.log(`[Server] Client ${client.sessionId} requested to leave the lobby.`);
      if (this.state.players.has(client.sessionId)) {
        this.state.players.delete(client.sessionId);
        console.log(`[Server] Client ${client.sessionId} removed from lobby.`);
        this.broadcast("player_left", { playerId: client.sessionId });
      }
      this.logPlayers();
    });
  }

  startRedLightGreenLight() {
    console.log("[Server] Starting Red Light, Green Light...");
    this.toggleLight();
    this.lightInterval = setInterval(() => this.toggleLight(), Math.random() * 3000 + 2000); // Random interval
  }

  stopRedLightGreenLight() {
    console.log("[Server] Stopping Red Light, Green Light...");
    if (this.lightInterval) {
      clearInterval(this.lightInterval);
      this.lightInterval = null;
    }
    this.state.light = "Red"; // Reset light
  }

  toggleLight() {
    this.state.light = this.state.light === "Red" ? "Green" : "Red";
    console.log(`[Server] Light toggled to: ${this.state.light}`);
    this.broadcast("light_update", { light: this.state.light });
  }

  checkFinishLine(client: Client, player: Player) {
    if (player.position >= this.state.finishLine) {
      console.log(`[Server] Player ${client.sessionId} reached the finish line!`);
      this.broadcast("game_over", { winner: client.sessionId });
      this.stopRedLightGreenLight();
    }
  }

  onJoin(client: Client) {
    console.log(`[Server] Client ${client.sessionId} joined the room.`);
  }

  onLeave(client: Client) {
    console.log(`[Server] Client ${client.sessionId} left the room.`);
    if (this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId);
      this.broadcast("player_left", { playerId: client.sessionId });
    }
    this.logPlayers();
  }

  logPlayers() {
    console.log(`[Server] Current players in lobby: ${Array.from(this.state.players.keys()).join(", ")}`);
  }

  onDispose() {
    console.log("[Server] Room disposed.");
    this.stopRedLightGreenLight();
  }
}
