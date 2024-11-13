// RPSGame.ts

export type Move = "rock" | "paper" | "scissors";

export interface RPSGameState {
  player1Move: Move | null;
  player2Move: Move | null;
  winner: string | null;
  gameInProgress: boolean;
}

export class RPSGame implements RPSGameState {
  player1Move: Move | null = null;
  player2Move: Move | null = null;
  winner: string | null = null;
  gameInProgress: boolean = true;

  makeMove(player: number, move: Move) {
    if (!this.gameInProgress) return;

    if (player === 1) this.player1Move = move;
    else if (player === 2) this.player2Move = move;

    // Check if both players have made a move
    if (this.player1Move && this.player2Move) {
      this.determineWinner();
    }
  }

  determineWinner() {
    if (this.player1Move === this.player2Move) {
      this.winner = "draw";
    } else if (
      (this.player1Move === "rock" && this.player2Move === "scissors") ||
      (this.player1Move === "scissors" && this.player2Move === "paper") ||
      (this.player1Move === "paper" && this.player2Move === "rock")
    ) {
      this.winner = "Player 1";
    } else {
      this.winner = "Player 2";
    }
    this.gameInProgress = false;
  }

  resetGame() {
    this.player1Move = null;
    this.player2Move = null;
    this.winner = null;
    this.gameInProgress = true;
  }
}
