// RPSGameBoard.tsx

import React, { useEffect, useState } from "react";
import { Client, Room } from "colyseus.js";
import { RPSGameState, Move } from "../../types/types";

const RPSGameBoard: React.FC = () => {
  const [room, setRoom] = useState<Room<RPSGameState> | null>(null);
  const [gameState, setGameState] = useState<RPSGameState | null>(null);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null); // Track the player's assigned number

  useEffect(() => {
    const connectToRoom = async () => {
      const client = new Client("ws://localhost:2567");
      const room = await client.joinOrCreate<RPSGameState>("rps_room");
      setRoom(room);

      // Listen for the assigned player number
      (room as any).onMessage("playerNumber", (number: number) => {
        setPlayerNumber(number);
      });

      // Listen for game state updates
      (room as any).onMessage("state", (state: RPSGameState) => {
        setGameState(state);
      });
    };

    connectToRoom();
  }, []);

  const makeMove = (move: Move) => {
    if (room && gameState?.gameInProgress && playerNumber) {
      room.send("move", { player: playerNumber, move });
    }
  };

  const resetGame = () => {
    if (room) {
      room.send("reset"); // Triggers the newGame function on the server
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Rock Paper Scissors</h1>
      {playerNumber && <h2>You are Player {playerNumber}</h2>} {/* Display current player */}
      {gameState?.winner ? (
        <h2>{gameState.winner === "draw" ? "It's a draw!" : `${gameState.winner} wins!`}</h2>
      ) : (
        <h2>Game in Progress</h2>
      )}
      <div>
        <button onClick={() => makeMove("rock")} disabled={!gameState?.gameInProgress}>
          Rock
        </button>
        <button onClick={() => makeMove("paper")} disabled={!gameState?.gameInProgress}>
          Paper
        </button>
        <button onClick={() => makeMove("scissors")} disabled={!gameState?.gameInProgress}>
          Scissors
        </button>
      </div>
      {gameState && (
        <div>
          <p>Player 1 Move: {gameState.player1Move || "Waiting..."}</p>
          <p>Player 2 Move: {gameState.player2Move || "Waiting..."}</p>
        </div>
      )}
      {gameState?.winner && <button onClick={resetGame}>Play Again</button>}
    </div>
  );
};

export default RPSGameBoard;
