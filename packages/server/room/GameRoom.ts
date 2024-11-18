import { Room, Client } from "colyseus";
import { Schema, type, ArraySchema, MapSchema } from "@colyseus/schema";

class Player extends Schema {
  @type("string") id: string;
  @type("number") points: number = 0;

  constructor(id: string) {
    super();
    this.id = id;
  }
}

class GameState extends Schema {
  @type("string") currentGame: string = "welcome";
  @type(["string"]) players: ArraySchema<string> = new ArraySchema<string>();
  @type({ map: Player }) playerScores: MapSchema<Player> = new MapSchema<Player>();
}

export class GameRoom extends Room<GameState> {
  onCreate() {
    this.setState(new GameState());
    console.log(`[GameRoom] Room created. Initial game state: ${this.state.currentGame}`);
    console.log(`[GameRoom] Lobby initialized.`);

    this.onMessage("change_game", (client, newGame: string) => {
      console.log(`[GameRoom] Changing game to: ${newGame}`);
      this.state.currentGame = newGame;
      this.updatePlayerScores(); // Add points to all players
      console.log(`[GameRoom] Updated scores: ${this.logScores()}`);
      this.broadcast("game_changed", { newGame, playerScores: this.getPlayerScores() });
    });

    this.onMessage("join_lobby", (client) => {
      console.log(`[GameRoom] Client ${client.sessionId} joined the lobby.`);
      if (!this.state.players.includes(client.sessionId)) {
        this.state.players.push(client.sessionId);
        this.state.playerScores.set(client.sessionId, new Player(client.sessionId));
        this.broadcast("player_joined", { playerId: client.sessionId });
      }
      this.logLobbyState();
    });

    this.onMessage("leave_lobby", (client) => {
      console.log(`[GameRoom] Client ${client.sessionId} left the lobby.`);
      const index = this.state.players.indexOf(client.sessionId);
      if (index !== -1) {
        this.state.players.splice(index, 1);
        this.state.playerScores.delete(client.sessionId);
        this.broadcast("player_left", { playerId: client.sessionId });
      }
      this.logLobbyState();
    });
  }

  updatePlayerScores() {
    this.state.playerScores.forEach((player) => {
      player.points += 1; // Increment points
    });
  }

  getPlayerScores() {
    return Array.from(this.state.playerScores.values()).map((player) => ({
      id: player.id,
      points: player.points,
    }));
  }

  onJoin(client: Client) {
    console.log(`[GameRoom] Client ${client.sessionId} joined.`);
  }

  onLeave(client: Client) {
    console.log(`[GameRoom] Client ${client.sessionId} left.`);
    const index = this.state.players.indexOf(client.sessionId);
    if (index !== -1) {
      this.state.players.splice(index, 1);
      this.state.playerScores.delete(client.sessionId);
      this.broadcast("player_left", { playerId: client.sessionId });
    }
    this.logLobbyState();
  }

  logScores() {
    return Array.from(this.state.playerScores.values())
      .map((player) => `${player.id}: ${player.points}`)
      .join(", ");
  }

  logLobbyState() {
    console.log(`[GameRoom] Players in lobby: ${this.state.players.join(", ")}`);
  }

  onDispose() {
    console.log("[GameRoom] Room disposed.");
  }
}
