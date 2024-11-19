import React, { useState, useEffect } from "react";
import { Room } from "colyseus.js";

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

  useEffect(() => {
    room.onMessage("rps_started", (data) => {
      const { player1, player2 } = data;
      if (room.sessionId === player1) {
        setPlayerNumber(1);
        setOpponent(player2);
      } else {
        setPlayerNumber(2);
        setOpponent(player1);
      }
      setIsWaiting(false);
      console.log("[Client] RPS game started.");
    });

    room.onMessage("rps_move_made", (data) => {
      const { player1Move, player2Move } = data;
      setPlayerMove(player1Move || null);
      setOpponentMove(player2Move || null);
      console.log("[Client] Move updated.");
    });

    room.onMessage("rps_completed", (data) => {
      const { winner } = data;
      setWinner(winner);
      console.log("[Client] Game completed. Winner:", winner);
    });

    room.onMessage("waiting_for_match", () => {
      console.log("[Client] Waiting for opponent...");
      setIsWaiting(true);
    });

    return () => {
      room.removeAllListeners();
    };
  }, [room]);

  const makeMove = (move: "rock" | "paper" | "scissors") => {
    if (!winner && !playerMove) {
      setPlayerMove(move);
      room.send("rps_move", move);
      console.log(`[Client] Sent move: ${move}`);
    }
  };

  if (isWaiting) {
    return <h2>Waiting for an opponent...</h2>;
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Rock Paper Scissors</h1>
      {opponent && <h2>Opponent: {opponent}</h2>}
      {winner ? (
        <h2>{winner === "draw" ? "It's a draw!" : `${winner} wins!`}</h2>
      ) : (
        <h2>Game in progress...</h2>
      )}
      <div>
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
      <div>
        <p>Your Move: {playerMove || "Waiting..."}</p>
        <p>Opponent's Move: {opponentMove || "Waiting..."}</p>
      </div>
    </div>
  );
};

export default RockPaperScissors;
