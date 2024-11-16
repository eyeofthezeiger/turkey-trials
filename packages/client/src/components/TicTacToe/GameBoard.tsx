// GameBoard.tsx

import React, { useEffect, useState } from "react";
import { Client, Room } from "colyseus.js";
import { GameState } from "../../types/types"; // Import the client-specific GameState type

const GameBoard: React.FC = () => {
  const [room, setRoom] = useState<Room<GameState> | null>(null);
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [currentTurn, setCurrentTurn] = useState("X");
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    const connectToRoom = async () => {
      const client = new Client("ws://localhost:2567");
      const room = await client.joinOrCreate<GameState>("tic_tac_toe");
      setRoom(room);

      // Cast room as any to avoid TypeScript issues with onMessage
      (room as any).onMessage("state", (state: GameState) => {
        setBoard([...state.board]);
        setCurrentTurn(state.currentTurn);
        setWinner(state.winner);
      });
    };

    connectToRoom();
  }, []);

  const handleCellClick = (index: number) => {
    if (room && board[index] === "" && !winner) {
      room.send("move", { index });
    }
  };

  const resetGame = () => {
    if (room) {
      room.send("reset");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Tic Tac Toe</h1>
      {winner ? (
        <h2>{winner === "draw" ? "It's a draw!" : `${winner} wins!`}</h2>
      ) : (
        <h2>Turn: {currentTurn}</h2>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 100px)", gap: "10px", margin: "20px auto" }}>
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
      {winner && <button onClick={resetGame}>Play Again</button>}
    </div>
  );
};

export default GameBoard;
