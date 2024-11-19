// games/RockPaperScissors.ts

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

        // Award points
        if (winner === "player1") {
          if (player1) player1.points += 10; // Winner
          if (player2) player2.points += 7; // Runner-up
        } else if (winner === "player2") {
          if (player2) player2.points += 10; // Winner
          if (player1) player1.points += 7; // Runner-up
        }

        // Broadcast updated points
        this.broadcastPointsUpdate();

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

  broadcastPointsUpdate() {
    const points: { [key: string]: number } = {};
    for (const [id, player] of this.state.players.entries()) {
      points[id] = player.points;
    }
    this.broadcast("points_update", { points });
}


  handlePlayerLeave(playerId: string) {
    // Handle player leaving during a game
    const gameIndex = this.state.rpsGames.findIndex(
      (g) => g.player1 === playerId || g.player2 === playerId
    );
    if (gameIndex !== -1) {
      const game = this.state.rpsGames[gameIndex];
      game.completed = true;

      // Determine winner based on who left
      const winner = game.player1 === playerId ? "player2" : "player1";
      game.winner = winner;

      // Update opponent's status
      const opponentId = game.player1 === playerId ? game.player2 : game.player1;
      const opponent = this.state.players.get(opponentId);
      if (opponent) {
        opponent.inGame = false;
        opponent.waiting = false;
      }

      // Award points
      if (winner === "player1") {
        const player1 = this.state.players.get(game.player1);
        if (player1) player1.points += 10;
      } else if (winner === "player2") {
        const player2 = this.state.players.get(game.player2);
        if (player2) player2.points += 10;
      }

      // Broadcast updated points
      this.broadcastPointsUpdate();

      // Notify clients
      this.broadcast("rps_completed", { winner, player1: game.player1, player2: game.player2 });

      // Remove the game from the list
      this.state.rpsGames.splice(gameIndex, 1);

      // Match players again if there are waiting players
      this.matchPlayersForRPS();
    }
  }
}
