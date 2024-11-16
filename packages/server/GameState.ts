// GameState.ts

export interface GameState {
    board: string[];
    currentTurn: string;
    winner: string | null;
    gameInProgress: boolean;
  }
  
  export class TicTacToeGame implements GameState {
    board: string[] = ["", "", "", "", "", "", "", "", ""];
    currentTurn: string = "X";
    winner: string | null = null;
    gameInProgress: boolean = true;
  
    resetGame() {
      this.board = ["", "", "", "", "", "", "", "", ""];
      this.currentTurn = "X";
      this.winner = null;
      this.gameInProgress = true;
    }
  
    makeMove(index: number): boolean {
      if (!this.gameInProgress || this.board[index] !== "") return false;
  
      // Place the mark for the current player
      this.board[index] = this.currentTurn;
  
      // Check for a winner after the move
      const result = this.checkWin();
      if (result) {
        this.winner = result;
        this.gameInProgress = false;
        return true;
      }
  
      // Switch turns
      this.currentTurn = this.currentTurn === "X" ? "O" : "X";
      return true;
    }
  
    private checkWin(): string | null {
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
  
      for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
          return this.board[a];
        }
      }
  
      if (!this.board.includes("")) {
        return "draw";
      }
  
      return null;
    }
  }
  