// GameRoom.ts

import { Room, Client } from "colyseus";
import { GameState } from "../models/GameState";
import { Player } from "../models/Player";
import { TicTacToe } from "../games/TicTacToe";
import { RockPaperScissors } from "../games/RockPaperScissors";
import { SlidingPuzzle } from "../games/SlidingPuzzle";
import { RedLightGreenLight } from "../games/RedLightGreenLight";

export class GameRoom extends Room<GameState> {
  private ticTacToe: TicTacToe;
  private rockPaperScissors: RockPaperScissors;
  private slidingPuzzle: SlidingPuzzle;
  private redLightGreenLight: RedLightGreenLight;

  onCreate() {
    this.setState(new GameState());
    console.log(`[Server] Room created. Initial game state: ${this.state.currentGame}`);

    // Initialize game logic components
    this.ticTacToe = new TicTacToe(this.state, this.broadcast.bind(this));
    this.rockPaperScissors = new RockPaperScissors(this.state, this.broadcast.bind(this));
    this.slidingPuzzle = new SlidingPuzzle(this.state, this.broadcast.bind(this));
    this.redLightGreenLight = new RedLightGreenLight(this.state, this.broadcast.bind(this));

    // Handle game state changes
    this.onMessage("change_game", (client, newGame: string) => {
      console.log(`[Server] Received game change request: ${newGame} from ${client.sessionId}`);
      this.state.currentGame = newGame;
      this.broadcast("game_changed", newGame);

      if (newGame === "game1") {
        this.redLightGreenLight.startRedLightGreenLight();
      } else if (newGame === "game2") {
        this.ticTacToe.startTicTacToe();
      } else if (newGame === "game3") {
        this.slidingPuzzle.startSlidingPuzzle();
      } else if (newGame === "final") {
        this.rockPaperScissors.matchPlayersForRPS();
      } else if (newGame === "tournament_over") {
        this.broadcastPointsUpdate();
      } else {
        this.stopAllTimers();
      }
    });

    // Handle player joining the lobby
    this.onMessage("join_lobby", (client) => {
      console.log(`[Server] Client ${client.sessionId} requested to join the lobby.`);
      if (!this.state.players.has(client.sessionId)) {
        this.state.players.set(client.sessionId, new Player(client.sessionId));
        console.log(`[Server] Client ${client.sessionId} added to lobby.`);
        this.broadcast("player_joined", { playerId: client.sessionId });
        if (this.state.currentGame === "game2") {
          this.ticTacToe.matchPlayersForTicTacToe();
        } else if (this.state.currentGame === "final") {
          this.rockPaperScissors.matchPlayersForRPS();
        }
      }
      this.logPlayers();
    });

    // Handle Tic Tac Toe moves
    this.onMessage("move", (client, { index }: { index: number }) => {
      this.ticTacToe.handleMove(client, index);
    });

    // Reset Tic Tac Toe game
    this.onMessage("reset_game", (client) => {
      this.ticTacToe.resetGame(client);
    });

    // Handle player movements for Red Light, Green Light
    this.onMessage("rlgl_move", (client) => {
      this.redLightGreenLight.handlePlayerMove(client);
    });

    // Handle Rock Paper Scissors moves
    this.onMessage("rps_move", (client, move: string) => {
      this.rockPaperScissors.handleMove(client, move);
    });

    // Handle puzzle completion for Sliding Puzzle
    this.onMessage("complete_puzzle", (client, puzzleTime: number) => {
      this.slidingPuzzle.handlePuzzleCompletion(client, puzzleTime);
    });

    // Handle points request
    this.onMessage("request_points", (client) => {
      this.broadcastPointsUpdate();
    });
  }

  broadcastPointsUpdate() {
    const points: { [key: string]: number } = {};
    for (const [id, player] of this.state.players.entries()) {
      points[id] = player.points;
    }
    this.broadcast("points_update", { points });
}

  stopAllTimers() {
    this.slidingPuzzle.stopTimer();
    this.redLightGreenLight.stopLightInterval();
    this.state.timerRunning = false;
  }

  onJoin(client: Client) {
    console.log(`[Server] Client ${client.sessionId} joined the room.`);
  }

  onLeave(client: Client) {
    console.log(`[Server] Client ${client.sessionId} left the room.`);
    if (this.state.players.has(client.sessionId)) {
      const player = this.state.players.get(client.sessionId);
      player.inGame = false;
      player.waiting = false;
      this.state.players.delete(client.sessionId);

      // Handle player leave based on current game
      if (this.state.currentGame === "game2") {
        this.ticTacToe.handlePlayerLeave(client.sessionId);
        this.ticTacToe.matchPlayersForTicTacToe();
      } else if (this.state.currentGame === "final") {
        this.rockPaperScissors.handlePlayerLeave(client.sessionId);
      } else if (this.state.currentGame === "game1") {
        this.redLightGreenLight.handlePlayerLeave(client.sessionId);
      }

      this.broadcast("player_left", { playerId: client.sessionId });
    }
    this.logPlayers();
  }

  logPlayers() {
    console.log(
      `[Server] Current players in lobby: ${Array.from(this.state.players.keys()).join(", ")}`
    );
  }

  onDispose() {
    console.log("[Server] Room disposed.");
    this.stopAllTimers();
  }
}
