import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

// Define Player schema
class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("string") color: string;
  @type("boolean") isHost: boolean = false;

  constructor(id: string, name: string, color: string) {
    super();
    this.id = id;
    this.name = name;
    this.color = color;
  }
}

// Define RoomState schema
class RoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("boolean") gameStarted: boolean = false;
}

export class GameLobby extends Room<RoomState> {
  onCreate() {
    this.setState(new RoomState());
    console.log("GameLobby room created");

    this.onMessage("startGame", (client: Client) => {
      if (this.clients[0].sessionId !== client.sessionId) {
        client.send("error", "Only the host can start the game.");
        return;
      }

      this.state.gameStarted = true;
      this.broadcast("gameStarted", { roomId: this.roomId });
    });
  }

  onJoin(client: Client, options: { name: string; color: string }) {
    const isRejoining = !!this.state.players.get(client.sessionId);

    if (isRejoining) {
      console.log(`Player ${client.sessionId} is rejoining.`);
      const rejoiningPlayer = this.state.players.get(client.sessionId);

      if (rejoiningPlayer) {
        rejoiningPlayer.name = options.name || rejoiningPlayer.name;
        rejoiningPlayer.color = options.color || rejoiningPlayer.color;
      }

      // Send current game state to rejoining player
      client.send("gameState", {
        gameStarted: this.state.gameStarted,
        players: Array.from(this.state.players.values()).map((player) => ({
          id: player.id,
          name: player.name,
          color: player.color,
          isHost: player.isHost,
        })),
      });
    } else {
      // New player joining
      const player = new Player(client.sessionId, options.name, options.color);

      if (this.state.players.size === 0) {
        player.isHost = true;
        this.broadcast("hostAssigned", { hostId: client.sessionId, name: player.name });
      }

      this.state.players.set(client.sessionId, player);
      this.broadcast("playerJoined", { id: client.sessionId, name: player.name, color: player.color });
    }
  }

  onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId);

    if (player) {
      console.log(`Player ${player.name} (${client.sessionId}) disconnected.`);
      // Keep the player in the game state for potential reconnection
      this.broadcast("playerLeft", { id: client.sessionId });
    }
  }
}
