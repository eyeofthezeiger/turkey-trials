import React, { useState, useEffect } from "react";

type Move = "rock" | "paper" | "scissors" | null;

interface RPSGameState {
  player1Move: Move;
  player2Move: Move;
  winner: string | null;
  gameInProgress: boolean;
}

const RockPaperScissors: React.FC = () => {
  const [gameState, setGameState] = useState<RPSGameState>({
    player1Move: null,
    player2Move: null,
    winner: null,
    gameInProgress: true,
  });
  const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null);

  // Assign player number (Player 1 or 2) on initial render
  const assignPlayer = () => {
    if (!playerNumber) {
      const assignedPlayer = Math.random() > 0.5 ? 1 : 2;
      setPlayerNumber(assignedPlayer);
    }
  };

  // Determine winner
  const determineWinner = (player1Move: Move, player2Move: Move): string | null => {
    if (!player1Move || !player2Move) return null;

    if (player1Move === player2Move) return "draw";
    if (
      (player1Move === "rock" && player2Move === "scissors") ||
      (player1Move === "paper" && player2Move === "rock") ||
      (player1Move === "scissors" && player2Move === "paper")
    ) {
      return "Player 1";
    }
    return "Player 2";
  };

  const makeMove = (move: Move) => {
    if (!gameState.gameInProgress || !playerNumber) return;

    setGameState((prevState) => {
      const newState = { ...prevState };
      if (playerNumber === 1) {
        newState.player1Move = move;
      } else {
        newState.player2Move = move;
      }

      if (newState.player1Move && newState.player2Move) {
        newState.winner = determineWinner(newState.player1Move, newState.player2Move);
        newState.gameInProgress = false;
      }

      return newState;
    });
  };

  const resetGame = () => {
    setGameState({
      player1Move: null,
      player2Move: null,
      winner: null,
      gameInProgress: true,
    });
    setPlayerNumber(null); // Optionally reset player assignment
  };

  useEffect(() => {
    assignPlayer();
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Rock Paper Scissors</h1>
      {playerNumber && <h2>You are Player {playerNumber}</h2>}
      {gameState.winner ? (
        <h2>
          {gameState.winner === "draw"
            ? "It's a draw!"
            : `${gameState.winner} wins!`}
        </h2>
      ) : (
        <h2>Game in Progress</h2>
      )}
      <div>
        <button
          onClick={() => makeMove("rock")}
          disabled={!gameState.gameInProgress || !playerNumber}
        >
          Rock
        </button>
        <button
          onClick={() => makeMove("paper")}
          disabled={!gameState.gameInProgress || !playerNumber}
        >
          Paper
        </button>
        <button
          onClick={() => makeMove("scissors")}
          disabled={!gameState.gameInProgress || !playerNumber}
        >
          Scissors
        </button>
      </div>
      <div>
        <p>Player 1 Move: {gameState.player1Move || "Waiting..."}</p>
        <p>Player 2 Move: {gameState.player2Move || "Waiting..."}</p>
      </div>
      {gameState.winner && (
        <button onClick={resetGame} style={{ marginTop: "20px" }}>
          Play Again
        </button>
      )}
    </div>
  );
};

export default RockPaperScissors;
