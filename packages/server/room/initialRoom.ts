import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

// Player schema to track player-specific data
// Player schema to track player-specific data
class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("string") color: string;
  @type("number") score: number = 0;
  @type("boolean") isHost: boolean = false; // Add isHost property

  constructor(id: string, name: string, color: string) {
    super();
    this.id = id;
    this.name = name;
    this.color = color;
  }
}


// Room state schema
class RoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("boolean") gameStarted: boolean = false;
  @type("string") currentGame: string = "";
  @type("number") currentGameIndex: number = -1; // Tracks the current game index
  @type("boolean") triviaActive: boolean = false; // Tracks if trivia is active
  @type("number") maxPlayers: number = 60;

  // Fixed game order
  gameOrder = ["red light green light", "tic tac toe", "sliding puzzle", "rock paper scissors"];
}

export class GameLobby extends Room<RoomState> {
  maxClients = 60;

  onCreate(options: any) {
    this.setState(new RoomState());
    console.log("GameLobby room created with ID:", this.roomId);

    // Handle start game message
    this.onMessage("startGame", (client) => {
      if (this.clients[0].sessionId !== client.sessionId) {
        client.send("error", { message: "Only the host can start the game." });
        return;
      }
      if (!this.state.gameStarted) {
        this.state.gameStarted = true;
        this.state.currentGameIndex = 0;
        this.startNextGame();
      } else {
        client.send("error", { message: "The game has already started." });
      }
    });

    // Handle player updates
    this.onMessage("updatePlayer", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        if (data.color) player.color = data.color;
        if (data.name) player.name = data.name;
        this.broadcast("playerUpdated", { id: client.sessionId, name: player.name, color: player.color });
      } else {
        client.send("error", { message: "Player not found." });
      }
    });
  }

  onJoin(client: Client, options: any) {
    const { name, color } = options;
  
    // Check if the first player is joining the room
    const isFirstPlayer = this.state.players.size === 0;
  
    const player = new Player(client.sessionId, name || "Anonymous", color || "blue");
    this.state.players.set(client.sessionId, player);
  
    if (isFirstPlayer) {
      // Assign the first player as the host
      this.state.gameStarted = false;
      this.state.currentGame = "Lobby";
      player.isHost = true; // Add an isHost property in Player schema
      this.broadcast("hostAssigned", { hostId: client.sessionId, name: player.name });
    }
  
    this.broadcast("playerJoined", { id: client.sessionId, name: player.name, color: player.color });
  }
  

  onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      this.state.players.delete(client.sessionId);
      this.broadcast("playerLeft", { id: client.sessionId, name: player.name });
      console.log(`Player ${player.name} left the room.`);
    }
  }

  onDispose() {
    console.log(`Room ${this.roomId} is being disposed.`);
  }

  private startNextGame() {
    if (this.state.currentGameIndex >= this.state.gameOrder.length) {
      this.broadcast("gameSequenceComplete", { message: "All games have been played!" });
      this.state.gameStarted = false;
      this.state.currentGameIndex = -1; // Reset index for potential replay
      return;
    }

    const nextGame = this.state.gameOrder[this.state.currentGameIndex];
    this.state.currentGame = nextGame;
    this.broadcast("gameStarted", { game: nextGame });

    console.log(`Starting game: ${nextGame}`);

    this.clock.setTimeout(() => {
      this.state.currentGameIndex += 1;
      this.state.triviaActive = false;
      this.startNextGame();
    }, 60000);
  }
}
