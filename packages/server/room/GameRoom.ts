import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

class GameState extends Schema {
  @type("string") currentGame: string = "welcome";
  @type({ map: "string" }) players: MapSchema<string> = new MapSchema<string>();
}

export class GameRoom extends Room<GameState> {
  onCreate() {
    this.setState(new GameState());
    console.log(`[Server] Room created. Initial game state: ${this.state.currentGame}`);

    // Handle game state changes
    this.onMessage("change_game", (client, newGame: string) => {
      console.log(`[Server] Received game change request: ${newGame} from ${client.sessionId}`);
      this.state.currentGame = newGame;
      console.log(`[Server] Game state updated to: ${this.state.currentGame}`);
      this.broadcast("game_changed", newGame);
    });

    // Handle player joining lobby
    this.onMessage("join_lobby", (client) => {
      console.log(`[Server] Client ${client.sessionId} requested to join the lobby.`);
      if (!this.state.players.has(client.sessionId)) {
        this.state.players.set(client.sessionId, client.sessionId);
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
    console.log(`[Server] Current players in lobby: ${Array.from(this.state.players.values()).join(", ")}`);
  }

  onDispose() {
    console.log("[Server] Room disposed.");
  }
}
