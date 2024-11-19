import React, { useEffect, useState } from "react";
import { Room } from "colyseus.js";

interface Props {
  room: Room;
}

const TicTacToe: React.FC<Props> = ({ room }) => {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [currentTurn, setCurrentTurn] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [playerMark, setPlayerMark] = useState<"X" | "O" | null>(null); // Player's mark
  const [opponent, setOpponent] = useState<string | null>(null); // Opponent's session ID

  useEffect(() => {
    if (!room) {
      console.error("[Client] Room is not available.");
      return;
    }

    // Listen for server updates
    room.onMessage("tic_tac_toe_started", (data) => {
      console.log("[Client] Game started:", data);
      setBoard(Array(9).fill(""));
      setWinner(null);
      setIsWaiting(false);

      // Set player marks and opponent
      const { playerX, playerO } = data;
      if (room.sessionId === playerX) {
        setPlayerMark("X");
        setOpponent(playerO);
      } else {
        setPlayerMark("O");
        setOpponent(playerX);
      }
      setCurrentTurn("X"); // X always starts
    });

    room.onMessage("move_made", (data) => {
      console.log("[Client] Move made:", data);
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);

      if (data.winner) {
        setWinner(data.winner);
        console.log(`[Client] Game Over! Winner: ${data.winner}`);
      }
    });

    room.onMessage("game_completed", (data) => {
      console.log("[Client] Game completed:", data);
      setWinner(data.winner);
    });

    room.onMessage("waiting_for_match", () => {
      console.log("[Client] Waiting for match...");
      setIsWaiting(true);
    });

    return () => {
      room.removeAllListeners();
    };
  }, [room]);

  const handleCellClick = (index: number) => {
    if (board[index] === "" && !winner && currentTurn === playerMark) {
      console.log(`[Client] Making move at index: ${index}`);
      room.send("move", { index });
    }
  };

  const renderCell = (cell: string, index: number) => (
    <div
      key={index}
      onClick={() => handleCellClick(index)}
      style={{
        width: "100px",
        height: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid black",
        fontSize: "3em",
        cursor: cell === "" && currentTurn === playerMark && !winner ? "pointer" : "default",
        backgroundColor: cell === "" ? "#f9f9f9" : "#eaeaea",
      }}
    >
      <span style={{ color: "black" }}>{cell}</span>
    </div>
  );

  if (isWaiting) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1>Tic Tac Toe</h1>
        <h2>Waiting for another player...</h2>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Tic Tac Toe</h1>
      {opponent && <h2>Opponent: {opponent}</h2>}
      {winner ? (
        <h2>
          {winner === "draw" ? "It's a draw!" : `${winner} wins!`}
        </h2>
      ) : (
        <h2>
          {currentTurn === playerMark
            ? "Your Turn"
            : `${opponent ? "Opponent's Turn" : "Waiting for Opponent..."}`}
        </h2>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 100px)",
          gap: "5px",
          margin: "20px auto",
        }}
      >
        {board.map((cell, index) => renderCell(cell, index))}
      </div>
      {winner && (
        <button
          onClick={() => room.send("reset_game")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "black",
            color: "white",
            fontSize: "1.2em",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Play Again
        </button>
      )}
    </div>
  );
};

export default TicTacToe;
