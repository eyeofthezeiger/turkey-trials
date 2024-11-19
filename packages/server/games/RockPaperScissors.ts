// games/RPSLogic.ts

import { Client } from "colyseus";
import { GameState } from "../models/GameState";
import { Player } from "../models/Player";
import { RPSGame } from "../models/RPSGame";

export class RockPaperScissors {
  private state: GameState;
  private broadcast: Function;

  constructor(state: GameState, broadcast: Function) {
    this.state = state;
    this.broadcast = broadcast;
  }

  startRPSGame(player1: Player, player2: Player) {
    const game = new RPSGame();
    game.player1 = player1.id;
    game.player2 = player2.id;
    this.state.rpsGames.push(game);
    player1.inGame = true;
    player2.inGame = true;

    console.log(`[Server] Rock Paper Scissors game started: ${player1.id} vs ${player2.id}`);
    this.broadcast("rps_started", { player1: player1.id, player2: player2.id });
  }

  matchPlayersForRPS() {
    const waitingPlayers = Array.from(this.state.players.values()).filter((p) => !p.inGame && !p.waiting);
    while (waitingPlayers.length >= 2) {
      const player1 = waitingPlayers.pop();
      const player2 = waitingPlayers.pop();
      if (player1 && player2) this.startRPSGame(player1, player2);
    }
  }

  handleMove(client: Client, move: string) {
    const game = this.state.rpsGames.find(
      (g) => (g.player1 === client.sessionId || g.player2 === client.sessionId) && !g.completed
    );

    if (!game) return;

    if (game.player1 === client.sessionId) {
      game.movePlayer1 = move;
    } else if (game.player2 === client.sessionId) {
      game.movePlayer2 = move;
    }

    console.log(`[Server] Player ${client.sessionId} chose ${move}`);

    if (game.movePlayer1 && game.movePlayer2) {
      const winner = this.determineRPSWinner(game.movePlayer1, game.movePlayer2);

      if (winner === "draw") {
        console.log("[Server] RPS game ended in a draw. Restarting the game...");
        // Reset moves to start again
        game.movePlayer1 = null;
        game.movePlayer2 = null;
        this.broadcast("rps_draw", { player1: game.player1, player2: game.player2 });
        this.broadcast("rps_restart", { player1: game.player1, player2: game.player2 });
      } else {
        game.completed = true;
        game.winner = winner;
        // Update players' inGame status
        const player1 = this.state.players.get(game.player1);
        const player2 = this.state.players.get(game.player2);
        if (player1) player1.inGame = false;
        if (player2) player2.inGame = false;

        console.log(`[Server] RPS game completed. Winner: ${winner}`);
        this.broadcast("rps_completed", { winner, player1: game.player1, player2: game.player2 });

        // Remove the game from the list
        const gameIndex = this.state.rpsGames.indexOf(game);
        if (gameIndex > -1) {
          this.state.rpsGames.splice(gameIndex, 1);
        }

        // Match players again if there are waiting players
        this.matchPlayersForRPS();
      }
    }
  }

  private determineRPSWinner(move1: string, move2: string): string {
    if (move1 === move2) return "draw";
    if (
      (move1 === "rock" && move2 === "scissors") ||
      (move1 === "paper" && move2 === "rock") ||
      (move1 === "scissors" && move2 === "paper")
    ) {
      return "player1";
    }
    return "player2";
  }

  // In RPSLogic.ts

handlePlayerLeave(playerId: string) {
    // Find the game the player was in
    const game = this.state.rpsGames.find(
      (g) => (g.player1 === playerId || g.player2 === playerId) && !g.completed
    );
  
    if (game) {
      game.completed = true;
      game.winner = game.player1 === playerId ? "player2" : "player1";
      console.log(`[Server] Player ${playerId} left. Winner is ${game.winner}`);
  
      // Update the other player's inGame status
      const otherPlayerId = game.player1 === playerId ? game.player2 : game.player1;
      const otherPlayer = this.state.players.get(otherPlayerId);
      if (otherPlayer) otherPlayer.inGame = false;
  
      // Notify clients about the game completion
      this.broadcast("rps_completed", { winner: game.winner, player1: game.player1, player2: game.player2 });
  
      // Remove the game from the active games list
      const gameIndex = this.state.rpsGames.indexOf(game);
      if (gameIndex > -1) {
        this.state.rpsGames.splice(gameIndex, 1);
      }
  
      // Attempt to match players again
      this.matchPlayersForRPS();
    }
  }
  
}
