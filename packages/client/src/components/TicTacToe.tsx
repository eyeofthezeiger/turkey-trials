import React, { useState } from "react";

const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [currentTurn, setCurrentTurn] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<string | null>(null);

  // Function to check for a winner
  const checkWinner = (board: string[]): string | null => {
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
        return board[a]; // Return the winner (X or O)
      }
    }

    return board.includes("") ? null : "draw"; // Return "draw" if board is full and no winner
  };

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (board[index] === "" && !winner) {
      const newBoard = [...board];
      newBoard[index] = currentTurn;
      setBoard(newBoard);

      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
      } else {
        setCurrentTurn((prev) => (prev === "X" ? "O" : "X"));
      }
    }
  };

  // Reset the game
  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setCurrentTurn("X");
    setWinner(null);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Tic Tac Toe</h1>
      {winner ? (
        <h2>{winner === "draw" ? "It's a draw!" : `${winner} wins!`}</h2>
      ) : (
        <h2>Turn: {currentTurn}</h2>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 100px)",
          gap: "10px",
          margin: "20px auto",
        }}
      >
        {board.map((cell, index) => (
          <div
            key={index}
            onClick={() => handleCellClick(index)}
            style={{
              width: "100px",
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #000",
              fontSize: "2em",
              cursor: cell === "" && !winner ? "pointer" : "default",
              backgroundColor: cell === "" ? "#fff" : "#f0f0f0",
            }}
          >
            {cell}
          </div>
        ))}
      </div>
      {winner && (
        <button onClick={resetGame} style={{ marginTop: "20px", padding: "10px 20px" }}>
          Play Again
        </button>
      )}
    </div>
  );
};

export default TicTacToe;
