import { Room, Client } from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

class Player extends Schema {
  @type("number") position: number = 0; // Player's position on the track
  @type("string") id: string; // Player ID
  @type("number") puzzlesCompleted: number = 0; // Number of puzzles completed
  @type(["number"]) puzzleTimes: ArraySchema<number> = new ArraySchema<number>(); // Times for completed puzzles
  @type("boolean") inGame: boolean = false; // Is the player currently in a game
  @type("boolean") waiting: boolean = false; // Is the player waiting for a match

  constructor(id: string) {
    super();
    this.id = id;
  }
}

class TicTacToeGame extends Schema {
  @type(["string"]) board: ArraySchema<string> = new ArraySchema(...Array(9).fill(""));
  @type("string") currentTurn: string = "X";
  @type("string") playerX: string = "";
  @type("string") playerO: string = "";
  @type("boolean") completed: boolean = false;
}

class GameState extends Schema {
  @type("string") currentGame: string = "welcome"; // Current game state
  @type({ map: Player }) players: MapSchema<Player> = new MapSchema<Player>(); // Players in the game
  @type("string") light: string = "Red"; // Red or Green Light for RLGL
  @type("number") finishLine: number = 500; // Finish line for RLGL
  @type("string") currentImage: string = ""; // Current sliding puzzle image
  @type("number") remainingTime: number = 300000; // 5 minutes in milliseconds
  @type("boolean") timerRunning: boolean = false; // Whether the game timer is running
  @type([TicTacToeGame]) ticTacToeGames: ArraySchema<TicTacToeGame> = new ArraySchema<TicTacToeGame>();
}

export class GameRoom extends Room<GameState> {
  private lightInterval: NodeJS.Timeout | null = null;
  private gameTimer: NodeJS.Timeout | null = null;

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
      } else if (newGame === "game2") {
        this.startTicTacToe();
      } else if (newGame === "game3") {
        this.startSlidingPuzzle();
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
          this.matchPlayersForTicTacToe();
        }
      }
      this.logPlayers();
    });

    // Handle Tic Tac Toe moves
    this.onMessage("move", (client, { index }: { index: number }) => {
      const game = this.state.ticTacToeGames.find(
        (g) => g.playerX === client.sessionId || g.playerO === client.sessionId
      );

      if (!game || game.completed) return;

      console.log('move')

      const isPlayerX = game.playerX === client.sessionId;
      if ((game.currentTurn === "X" && isPlayerX) || (game.currentTurn === "O" && !isPlayerX)) {
        if (game.board[index] === "") {
          game.board[index] = game.currentTurn;
          console.log(`[Server] Move made by ${client.sessionId} at index ${index}`);

          const winner = this.checkWinner(game.board);
          if (winner) {
            game.completed = true;
            console.log(`[Server] Game completed! Winner: ${winner}`);
            this.broadcast("game_completed", { winner });
          } else if (!game.board.includes("")) {
            game.completed = true;
            console.log(`[Server] Game completed! It's a draw.`);
            this.broadcast("game_completed", { winner: "draw" });
          } else {
            game.currentTurn = game.currentTurn === "X" ? "O" : "X";
            console.log(`[Server] Turn changed to: ${game.currentTurn}`);
          }

          this.broadcast("move_made", {
            board: game.board.toArray(),
            currentTurn: game.currentTurn,
            winner: game.completed ? winner || "draw" : null,
          });
        }
      }
    });

    // Reset game
    this.onMessage("reset_game", (client) => {
      const game = this.state.ticTacToeGames.find(
        (g) => g.playerX === client.sessionId || g.playerO === client.sessionId
      );
      if (game) {
        game.board = new ArraySchema(...Array(9).fill(""));
        game.currentTurn = "X";
        game.completed = false;
        console.log(`[Server] Game reset by ${client.sessionId}`);
        this.broadcast("tic_tac_toe_started", {
          playerX: game.playerX,
          playerO: game.playerO,
        });
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

    // Handle puzzle completion for Sliding Puzzle
    this.onMessage("complete_puzzle", (client, puzzleTime: number) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      player.puzzlesCompleted += 1;
      player.puzzleTimes.push(puzzleTime);

      console.log(
        `[Server] Player ${client.sessionId} completed a puzzle. Total completed: ${player.puzzlesCompleted}`
      );

      // Assign a new puzzle image
      this.assignNewPuzzle();
      this.broadcast("puzzle_completed", {
        playerId: client.sessionId,
        puzzlesCompleted: player.puzzlesCompleted,
        puzzleTimes: player.puzzleTimes,
        newImage: this.state.currentImage,
      });
    });
  }

  startRedLightGreenLight() {
    console.log("[Server] Starting Red Light, Green Light...");
    this.toggleLight();
    this.lightInterval = setInterval(() => this.toggleLight(), Math.random() * 3000 + 2000); // Random interval
  }

  startTicTacToe() {
    console.log("[Server] Starting Tic Tac Toe...");
    this.matchPlayersForTicTacToe();
  }

  startSlidingPuzzle() {
    console.log("[Server] Starting Sliding Puzzle...");
    this.assignNewPuzzle();
    this.startGameTimer();
  }

  matchPlayersForTicTacToe() {
    const waitingPlayers = Array.from(this.state.players.values()).filter((p) => !p.inGame && !p.waiting);

    while (waitingPlayers.length >= 2) {
      const playerX = waitingPlayers.pop();
      const playerO = waitingPlayers.pop();
      if (playerX && playerO) {
        this.startTicTacToeGame(playerX, playerO);
      }
    }

    if (waitingPlayers.length === 1) {
      const unmatchedPlayer = waitingPlayers[0];
      unmatchedPlayer.waiting = true;
      this.broadcast("waiting_for_match", {}, {});
    }
  }

  startTicTacToeGame(playerX: Player, playerO: Player) {
    playerX.inGame = true;
    playerO.inGame = true;

    const game = new TicTacToeGame();
    game.playerX = playerX.id;
    game.playerO = playerO.id;

    this.state.ticTacToeGames.push(game);
    console.log(`[Server] New Tic Tac Toe game started: X=${playerX.id}, O=${playerO.id}`);
    this.broadcast("tic_tac_toe_started", {
      playerX: playerX.id,
      playerO: playerO.id,
    });
  }

  checkWinner(board: ArraySchema<string>): string | null {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of winningCombinations) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]; // Return "X" or "O"
      }
    }
    return null;
  }

  toggleLight() {
    this.state.light = this.state.light === "Red" ? "Green" : "Red";
    console.log(`[Server] Light toggled to: ${this.state.light}`);
    this.broadcast("light_update", { light: this.state.light });
  }

  assignNewPuzzle() {
    const images = ["pet1", "pet2", "pet3", "pet4", "pet5", "pet6", "pet7"];
    this.state.currentImage = images[Math.floor(Math.random() * images.length)];
    console.log(`[Server] Assigned new puzzle image: ${this.state.currentImage}`);
    this.broadcast("new_puzzle", { image: this.state.currentImage });
  }

  startGameTimer() {
    this.state.timerRunning = true;
    this.state.remainingTime = 300000; // Reset to 5 minutes

    this.gameTimer = setInterval(() => {
      this.state.remainingTime -= 1000;

      if (this.state.remainingTime <= 0) {
        console.log("[Server] Time's up!");
        this.stopAllTimers();
        this.broadcast("game_over");
      } else {
        this.broadcast("timer_update", { remainingTime: this.state.remainingTime });
      }
    }, 1000);
  }

  stopAllTimers() {
    if (this.lightInterval) clearInterval(this.lightInterval);
    if (this.gameTimer) clearInterval(this.gameTimer);

    this.lightInterval = null;
    this.gameTimer = null;
    this.state.timerRunning = false;
  }

  checkFinishLine(client: Client, player: Player) {
    if (player.position >= this.state.finishLine) {
      console.log(`[Server] Player ${client.sessionId} reached the finish line!`);
      this.broadcast("game_over", { winner: client.sessionId });
      this.stopAllTimers();
    }
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
      if (this.state.currentGame === "game2") {
        this.matchPlayersForTicTacToe();
      }
      this.broadcast("player_left", { playerId: client.sessionId });
    }
    this.logPlayers();
  }

  logPlayers() {
    console.log(`[Server] Current players in lobby: ${Array.from(this.state.players.keys()).join(", ")}`);
  }

  onDispose() {
    console.log("[Server] Room disposed.");
    this.stopAllTimers();
  }
}
