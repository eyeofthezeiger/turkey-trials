import React, { useState, useEffect } from "react";
import { Room } from "colyseus.js";
import "./../App.css";

interface Props {
  room: Room;
}

const RockPaperScissors: React.FC<Props> = ({ room }) => {
  const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [playerMove, setPlayerMove] = useState<string | null>(null);
  const [opponentMove, setOpponentMove] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState<boolean>(true);
  const [playerPoints, setPlayerPoints] = useState<number>(0);

  interface PointsUpdateMessage {
    points: { [key: string]: number };
  }

  useEffect(() => {
    // Listen for game state updates
    const setupListeners = () => {
      room.onMessage("rps_started", ({ player1, player2 }) => {
        if (room.sessionId === player1) {
          setPlayerNumber(1);
          setOpponent(player2);
        } else {
          setPlayerNumber(2);
          setOpponent(player1);
        }
        resetGameState();
        setIsWaiting(false);
        console.log("[Client] RPS game started.");
      });

      room.onMessage("rps_completed", ({ winner, movePlayer1, movePlayer2 }) => {
        setWinner(winner);
        setPlayerMove(room.sessionId === winner ? movePlayer1 : movePlayer2);
        setOpponentMove(room.sessionId !== winner ? movePlayer1 : movePlayer2);
        setIsWaiting(false);
        console.log(`[Client] Game completed. Winner: ${winner}`);
      });

      room.onMessage("rps_draw", () => {
        setWinner("draw");
        setIsWaiting(false);
        console.log("[Client] Game ended in a draw.");
      });

      room.onMessage("rps_restart", () => {
        console.log("[Client] Game restarting...");
        resetGameState();
        setIsWaiting(false);
      });

      room.onMessage("waiting_for_match", () => {
        console.log("[Client] Waiting for an opponent...");
        resetGameState();
        setIsWaiting(true);
      });

      room.onMessage("points_update", (data: PointsUpdateMessage) => {
        const points = data.points[room.sessionId];
        if (points !== undefined) {
          setPlayerPoints(points);
        }
      });
    };

    const resetGameState = () => {
      setPlayerMove(null);
      setOpponentMove(null);
      setWinner(null);
    };

    setupListeners();

    // Request initial points
    room.send("request_points");
  }, [room]);

  const makeMove = (move: "rock" | "paper" | "scissors") => {
    if (!winner && !playerMove) {
      setPlayerMove(move);
      room.send("rps_move", move);
      console.log(`[Client] Sent move: ${move}`);
    }
  };

  if (isWaiting) {
    return (
      <div className="rps">
        <h1>Rock Paper Scissors</h1>
        <h3>Your Points: {playerPoints}</h3>
        <h2>Waiting for an opponent...</h2>
      </div>
    );
  }

  return (
    <div className="rps">
      <h1>Rock Paper Scissors</h1>
      <h3>Your Points: {playerPoints}</h3>
      {opponent && <h2>Opponent: {opponent}</h2>}
      {winner ? (
        <div>
          <h2>
            {winner === "draw"
              ? "It's a draw!"
              : winner === `player${playerNumber}`
              ? "You win!"
              : "You lose."}
          </h2>
          {winner === `player${playerNumber}` ? (
            <h3>You earned 10 points!</h3>
          ) : (
            <h3>You earned 7 points!</h3>
          )}
        </div>
      ) : (
        <h2>Make your move</h2>
      )}
      {!winner && (
        <div className="rps-buttons">
          <button onClick={() => makeMove("rock")} disabled={!!playerMove}>
            Rock
          </button>
          <button onClick={() => makeMove("paper")} disabled={!!playerMove}>
            Paper
          </button>
          <button onClick={() => makeMove("scissors")} disabled={!!playerMove}>
            Scissors
          </button>
        </div>
      )}
      <div>
        <p>Your Move: {playerMove || "Waiting..."}</p>
        <p>Opponent's Move: {opponentMove || "Waiting..."}</p>
      </div>
    </div>
  );
};

export default RockPaperScissors;
