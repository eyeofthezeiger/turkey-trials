import { Room, Client } from "colyseus";
import { Schema, type } from "@colyseus/schema";

class TicTacToeState extends Schema {
  @type(["string"]) board: string[] = Array(9).fill("");
  @type("string") currentTurn: string = "X";
  @type("string") winner: string = "";
}

export class TicTacToeRoom extends Room<TicTacToeState> {
  onCreate() {
    this.setState(new TicTacToeState());
    console.log("Tic Tac Toe room created:", this.roomId);

    this.onMessage("move", (client, { index }) => {
      const { board, currentTurn } = this.state;

      if (board[index] === "" && this.state.winner === "") {
        board[index] = currentTurn;
        this.state.currentTurn = currentTurn === "X" ? "O" : "X";

        if (this.checkWinner()) {
          this.state.winner = currentTurn;
          this.broadcast("winner", { winner: currentTurn });
        } else if (board.every((cell) => cell !== "")) {
          this.state.winner = "draw";
          this.broadcast("winner", { winner: "draw" });
        }

        this.broadcast("state", this.state);
      }
    });
  }

  checkWinner() {
    const winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    return winningCombos.some(
      (combo) =>
        this.state.board[combo[0]] !== "" &&
        this.state.board[combo[0]] === this.state.board[combo[1]] &&
        this.state.board[combo[1]] === this.state.board[combo[2]]
    );
  }
}
