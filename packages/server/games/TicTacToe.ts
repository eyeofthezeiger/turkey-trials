// games/TicTacToe.ts

import { Client } from "colyseus";
import { GameState } from "../models/GameState";
import { Player } from "../models/Player";
import { TicTacToeGame } from "../models/TicTacToeGame";
import { ArraySchema } from "@colyseus/schema";

export class TicTacToe {
  private state: GameState;
  private broadcast: Function;

  constructor(state: GameState, broadcast: Function) {
    this.state = state;
    this.broadcast = broadcast;
  }

  startTicTacToe() {
    console.log("[Server] Starting Tic Tac Toe...");
    this.matchPlayersForTicTacToe();
  }

  matchPlayersForTicTacToe() {
    console.log('starting match players for tic tac toe')
    const waitingPlayers = Array.from(this.state.players.values()).filter(
      (p) => !p.inGame && !p.waiting
    );

    while (waitingPlayers.length >= 2) {
      const playerX = waitingPlayers.pop();
      const playerO = waitingPlayers.pop();

      if (playerX && playerO) {
        this.startGame(playerX, playerO);
      }
    }

    if (waitingPlayers.length > 0) {
      const waitingPlayer = waitingPlayers[0];
      waitingPlayer.waiting = true;
      console.log(`[Server] Player ${waitingPlayer.id} is waiting for an opponent.`);
      this.broadcast("waiting_for_match", { playerId: waitingPlayer.id });
    }
  }

  startGame(playerX: Player, playerO: Player) {
    playerX.inGame = true;
    playerO.inGame = true;
    playerX.waiting = false;
    playerO.waiting = false;

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

  handleMove(client: Client, index: number) {
    const game = this.state.ticTacToeGames.find(
      (g) => g.playerX === client.sessionId || g.playerO === client.sessionId
    );

    if (!game || game.completed) return;

    const isPlayerX = game.playerX === client.sessionId;
    if ((game.currentTurn === "X" && isPlayerX) || (game.currentTurn === "O" && !isPlayerX)) {
      if (game.board[index] === "") {
        game.board[index] = game.currentTurn;
        console.log(`[Server] Move made by ${client.sessionId} at index ${index}`);

        const winner = this.checkWinner(game.board);
        if (winner) {
          game.completed = true;
          console.log(`[Server] Game completed! Winner: ${winner}`);

          // Award points
          const playerX = this.state.players.get(game.playerX);
          const playerO = this.state.players.get(game.playerO);

          if (winner === "X") {
            if (playerX) playerX.points += 7;
            if (playerO) playerO.points += 0;
          } else if (winner === "O") {
            if (playerO) playerO.points += 7;
            if (playerX) playerX.points += 0;
          }

          // Broadcast updated points
          this.broadcastPointsUpdate();

          this.broadcast("game_completed", { winner });
        } else if (!game.board.includes("")) {
          game.completed = true;
          console.log(`[Server] Game completed! It's a draw.`);

          // Award points
          const playerX = this.state.players.get(game.playerX);
          const playerO = this.state.players.get(game.playerO);

          if (playerX) playerX.points += 4;
          if (playerO) playerO.points += 4;

          // Broadcast updated points
          this.broadcastPointsUpdate();

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
  }

  resetGame(client: Client) {
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
  }

  private checkWinner(board: ArraySchema<string>): string | null {
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

  broadcastPointsUpdate() {
    const points: { [key: string]: number } = {};
    for (const [id, player] of this.state.players.entries()) {
      points[id] = player.points;
    }
    this.broadcast("points_update", { points });
}


  handlePlayerLeave(playerId: string) {
    // Handle player leaving during a game
    const gameIndex = this.state.ticTacToeGames.findIndex(
      (g) => g.playerX === playerId || g.playerO === playerId
    );
    if (gameIndex !== -1) {
      const game = this.state.ticTacToeGames[gameIndex];
      game.completed = true;
      this.state.ticTacToeGames.splice(gameIndex, 1);

      // Update opponent's status
      const opponentId = game.playerX === playerId ? game.playerO : game.playerX;
      const opponent = this.state.players.get(opponentId);
      if (opponent) {
        opponent.inGame = false;
        opponent.waiting = false;
      }

      // Notify opponent
      this.broadcast("opponent_left", { opponentId });
    }
  }
}
