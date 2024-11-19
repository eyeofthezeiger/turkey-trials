/* components/TicTacToe.tsx */
import React, { useEffect, useState } from "react";
import { Room } from "colyseus.js";
import "./../App.css"; // Import the consolidated CSS file

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
  const [playerPoints, setPlayerPoints] = useState<number>(0);

  interface PointsUpdateMessage {
    points: { [key: string]: number };
  }

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

    room.onMessage("opponent_left", () => {
      console.log("[Client] Opponent left the game.");
      setIsWaiting(true);
    });

    // Listen for points updates
    room.onMessage("points_update", (data: PointsUpdateMessage) => {
      const points = data.points[room.sessionId];
      if (points !== undefined) {
        setPlayerPoints(points);
      }
    });

    // Request initial points
    room.send("request_points");

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
      className="tictactoe-cell"
    >
      <span>{cell}</span>
    </div>
  );

  if (isWaiting) {
    return (
      <div className="tictactoe">
        <h1>Tic Tac Toe</h1>
        <h3>Your Points: {playerPoints}</h3>
        <h2>Waiting for another player...</h2>
      </div>
    );
  }

  return (
    <div className="tictactoe">
      <h1>Tic Tac Toe</h1>
      <h3>Your Points: {playerPoints}</h3>
      {opponent && <h2>Opponent: {opponent}</h2>}
      {winner ? (
        <div>
          <h2>
            {winner === "draw"
              ? "It's a draw! You earned 4 points."
              : winner === playerMark
              ? "You win! You earned 7 points."
              : "You lose. You earned 0 points."}
          </h2>
        </div>
      ) : (
        <h2>
          {currentTurn === playerMark
            ? "Your Turn"
            : `${opponent ? "Opponent's Turn" : "Waiting for Opponent..."}`}
        </h2>
      )}
      <div className="tictactoe-board">
        {board.map((cell, index) => renderCell(cell, index))}
      </div>
      {winner && (
        <button
          onClick={() => room.send("reset_game")}
          className="tictactoe-reset-button"
        >
          Play Again
        </button>
      )}
    </div>
  );
};

export default TicTacToe;
