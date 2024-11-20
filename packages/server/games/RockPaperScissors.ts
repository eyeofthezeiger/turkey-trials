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

  matchPlayersForRPS() {
    console.log("[RPS] Starting matchmaking for Rock Paper Scissors.");

    const waitingPlayers = Array.from(this.state.players.values()).filter(
      (player) => !player.inGame && player.waiting
    );

    console.log("[RPS] Waiting players:", waitingPlayers.map((p) => p.id));

    while (waitingPlayers.length >= 2) {
      const player1 = waitingPlayers.shift(); // Remove the first player
      const player2 = waitingPlayers.shift(); // Remove the second player

      if (!player1 || !player2) break;

      this.startRPSGame(player1, player2);
    }

    console.log("[RPS] Matchmaking complete. Remaining players:", waitingPlayers.map((p) => p.id));
  }

  startRPSGame(player1: Player, player2: Player) {
    const game = new RPSGame();
    game.player1 = player1.id;
    game.player2 = player2.id;

    this.state.rpsGames.push(game);
    player1.inGame = true;
    player2.inGame = true;
    player1.waiting = false;
    player2.waiting = false;

    console.log(`[RPS] Game started: ${player1.id} vs ${player2.id}`);
    this.broadcast("rps_started", { player1: player1.id, player2: player2.id });
  }

  handleMove(client: Client, move: string) {
    const game = this.state.rpsGames.find(
      (g) => (g.player1 === client.sessionId || g.player2 === client.sessionId) && !g.completed
    );

    if (!game) {
      console.log(`[RPS] No active game found for ${client.sessionId}`);
      return;
    }

    const isPlayer1 = game.player1 === client.sessionId;
    if (isPlayer1) {
      game.movePlayer1 = move;
    } else {
      game.movePlayer2 = move;
    }

    console.log(`[RPS] Player ${client.sessionId} chose ${move}`);

    if (game.movePlayer1 && game.movePlayer2) {
      this.resolveGame(game);
    }
  }

  resolveGame(game: RPSGame) {
    const result = this.determineRPSWinner(game.movePlayer1, game.movePlayer2);
    const player1 = this.state.players.get(game.player1);
    const player2 = this.state.players.get(game.player2);

    if (!player1 || !player2) return;

    game.completed = true;
    if (result === "draw") {
      console.log(`[RPS] Game draw: ${game.player1} vs ${game.player2}`);
      this.broadcast("rps_draw", { player1: game.player1, player2: game.player2 });
    } else {
      const winnerId = result === "player1" ? game.player1 : game.player2;
      const loserId = result === "player1" ? game.player2 : game.player1;

      console.log(`[RPS] Winner: ${winnerId}`);
      game.winner = winnerId;

      const winner = result === "player1" ? player1 : player2;
      const loser = result === "player1" ? player2 : player1;

      winner.points += 10;
      loser.points += 5;

      this.broadcast("rps_completed", {
        winner: winnerId,
        player1: game.player1,
        player2: game.player2,
        movePlayer1: game.movePlayer1,
        movePlayer2: game.movePlayer2,
      });

      this.broadcastPointsUpdate();
    }

    // Remove game and match remaining players
    this.state.rpsGames.splice(this.state.rpsGames.indexOf(game), 1);
    this.matchPlayersForRPS();
  }

  determineRPSWinner(move1: string, move2: string): string {
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
    console.log("[RPS] Points update:", points);
  }

  handlePlayerLeave(playerId: string) {
    const game = this.state.rpsGames.find(
      (g) => g.player1 === playerId || g.player2 === playerId
    );

    if (game) {
      game.completed = true;
      const opponentId = game.player1 === playerId ? game.player2 : game.player1;

      const opponent = this.state.players.get(opponentId);
      if (opponent) {
        opponent.inGame = false;
      }

      this.broadcast("rps_player_left", { playerId, opponentId });
      this.state.rpsGames.splice(this.state.rpsGames.indexOf(game), 1);
    }

    this.matchPlayersForRPS();
  }
}
