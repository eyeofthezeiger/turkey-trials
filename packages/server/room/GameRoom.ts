// GameRoom.ts

import { Room, Client } from "colyseus";
import { GameState } from "../models/GameState";
import { Player } from "../models/Player";
import { SlidingPuzzle } from "../games/SlidingPuzzle";
import { RedLightGreenLight } from "../games/RedLightGreenLight";

export class GameRoom extends Room<GameState> {
  private slidingPuzzle: SlidingPuzzle;
  private redLightGreenLight: RedLightGreenLight;
  private hostId: string | null = null;
  private currentRound: number = 1;
  private totalRounds: number = 3;

  onCreate() {
    this.setState(new GameState());
    this.state.currentGame = "welcome"; // Initialize currentGame
    console.log(`[Server] Room created. Initial game state: ${this.state.currentGame}`);

    // Initialize game logic components
    this.redLightGreenLight = new RedLightGreenLight(this.state, this.broadcast.bind(this), this.currentRound);
    this.slidingPuzzle = new SlidingPuzzle(this.state, this.broadcast.bind(this));

    // Handle game state changes
    this.onMessage("change_game", (client, newGame: string) => {
      // Only allow the host to change the game
      if (client.sessionId !== this.hostId) {
        console.warn(`[Server] Non-host ${client.sessionId} attempted to change game.`);
        return;
      }

      console.log(`[Server] Received game change request: ${newGame} from ${client.sessionId}`);

      // Validate newGame
      const validGames = [
        "rlgl_round1",
        "rlgl_round2",
        "rlgl_round3",
        "final_puzzle",
        "tournament_over",
      ];

      if (!validGames.includes(newGame)) {
        console.warn(`[Server] Invalid game key: ${newGame}`);
        return;
      }

      // Update game state
      this.state.currentGame = newGame;

      // Broadcast the game change to all clients
      this.broadcast("game_changed", newGame);
      console.log(`[Server] Broadcasted game_changed: ${newGame}`);

      // Stop any ongoing game timers or intervals
      this.stopAllTimers();

      // Handle specific game initialization
      if (newGame.startsWith("rlgl_round")) {
        const roundNumber = parseInt(newGame.replace("rlgl_round", ""));
        if (!isNaN(roundNumber) && roundNumber >= 1 && roundNumber <= this.totalRounds) {
          this.currentRound = roundNumber;
          this.redLightGreenLight.startRedLightGreenLight(this.currentRound);
        } else {
          console.warn(`[Server] Invalid RLGL round number: ${newGame}`);
        }
      } else if (newGame === "final_puzzle") {
        // For final puzzle, the client handles image shuffling; server does not need to broadcast new puzzles
        // Optionally, reset some state if needed
        // Start game timer if necessary, but in current requirements, timer is on client side
      } else if (newGame === "tournament_over") {
        this.determineGameWinner();
      } else {
        console.warn(`[Server] Unknown game requested: ${newGame}`);
      }
    });

    this.onMessage("end_round", (client) => {
      if (client.sessionId !== this.hostId) {
        console.warn(`[Server] Non-host ${client.sessionId} attempted to end round.`);
        return;
      }
      console.log(`[Server] Host ${client.sessionId} requested to end the round.`);
      this.redLightGreenLight.handleEndRound();
    });

    this.onMessage("join_lobby", (client, data: { name: string; color: string }) => {
      const { name, color } = data;
      console.log(`[Server] Client ${client.sessionId} requested to join the lobby with name: ${name} and color: ${color}.`);
      
      if (!this.state.players.has(client.sessionId)) {
        const newPlayer = new Player(client.sessionId);
        newPlayer.name = name || "Anonymous";
        newPlayer.color = color || "#000000"; // Default to black if no color provided
        this.state.players.set(client.sessionId, newPlayer);
        console.log(`[Server] Client ${client.sessionId} added to lobby with name: ${name} and color: ${color}.`);
        this.broadcast("player_joined", { player: newPlayer });

        // Host assignment logic...
        if (!this.hostId) {
          this.hostId = client.sessionId;
          console.log(`[Server] Client ${client.sessionId} is assigned as the host.`);
          this.broadcast("host_assigned", { hostId: this.hostId });
        }
      } else {
        console.log(`[Server] Client ${client.sessionId} is already in the lobby.`);
      }

      this.logPlayers();
    });

    // Handle player leaving the lobby
    this.onMessage("leave_lobby", (client) => {
      console.log(`[Server] Client ${client.sessionId} requested to leave the lobby.`);
      this.removePlayer(client);
    });

    // Handle player movements for Red Light, Green Light
    this.onMessage("rlgl_move", (client) => {
      this.redLightGreenLight.handlePlayerMove(client);
    });

    // Handle puzzle completion for Sliding Puzzle
    this.onMessage("complete_puzzle", (client, puzzleData: { puzzleTime: number }) => {
      this.slidingPuzzle.handlePuzzleCompletion(client, puzzleData.puzzleTime);
    });

    // Handle points request
    this.onMessage("request_points", (client) => {
      this.sendPointsUpdate(client);
    });
  }

  determineGameWinner() {
    const sortedPlayers = Array.from(this.state.players.values()).sort((a, b) => b.points - a.points);
    const winner = sortedPlayers[0];
    const totalPoints = winner.points;

    // Broadcast game winner details
    this.broadcast("game_over", {
      winnerName: winner.name,
      totalPoints: totalPoints,
    });

    console.log(`[Server] Tournament Over. Winner: ${winner.name} with ${totalPoints} points.`);
  }

  broadcastPointsUpdate() {
    const points: { [key: string]: number } = {};
    for (const [id, player] of this.state.players.entries()) {
      points[id] = player.points;
    }
    this.broadcast("points_update", { points });
    console.log(`[Server] Broadcasted points_update:`, points);
  }

  sendPointsUpdate(client: Client) {
    const points: { [key: string]: number } = {};
    for (const [id, player] of this.state.players.entries()) {
      points[id] = player.points;
    }
    client.send("points_update", { points });
    console.log(`[Server] Sent points_update to ${client.sessionId}:`, points);
  }

  stopAllTimers() {
    this.redLightGreenLight.stopLightInterval();
    this.state.timerRunning = false;
    console.log("[Server] Stopped all game timers and intervals.");
  }

  removePlayer(client: Client) {
    console.log(`[Debug] Removing player ${client.sessionId}.`);
    if (this.state.players.has(client.sessionId)) {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        this.state.players.delete(client.sessionId);
        console.log(`[Server] Client ${client.sessionId} removed from lobby.`);
        this.broadcast("player_left", { playerId: client.sessionId });

        // If the host leaves, assign a new host
        if (client.sessionId === this.hostId) {
          const remainingPlayers = Array.from(this.state.players.keys());
          this.hostId = remainingPlayers.length > 0 ? remainingPlayers[0] : null;
          if (this.hostId) {
            console.log(`[Server] Client ${this.hostId} is assigned as the new host.`);
            this.broadcast("host_assigned", { hostId: this.hostId });
          } else {
            console.log("[Server] No players left in the lobby.");
          }
        }

        // If a player leaves who has finished, adjust finishOrder
        if (player.hasFinished) {
          this.redLightGreenLight.handlePlayerLeave(client.sessionId);
        }
      }
    } else {
      console.log(`[Debug] Client ${client.sessionId} was not in the lobby.`);
    }

    this.logPlayers();
  }

  onJoin(client: Client) {
    console.log(`[Server] Client ${client.sessionId} joined the room.`);
    // Clients need to send "join_lobby" to be added to players
  }

  onLeave(client: Client) {
    console.log(`[Server] Client ${client.sessionId} left the room.`);
    this.removePlayer(client);
  }

  logPlayers() {
    console.log("[Debug] Current players in lobby:");
    for (const [id, player] of this.state.players.entries()) {
      console.log(`Player ID: ${id}, Name: ${player.name}, Color: ${player.color}, Points: ${player.points}, Finished: ${player.hasFinished}`);
    }
  }

  onDispose() {
    console.log("[Server] Room disposed.");
    this.stopAllTimers();
  }
}
