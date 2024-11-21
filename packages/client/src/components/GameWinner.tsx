// components/GameWinner.tsx

import React from "react";
import "./GameWinner.css"; // Import the CSS file for styling

interface GameWinnerProps {
  winnerName: string;
  totalPoints: number;
}

const GameWinner: React.FC<GameWinnerProps> = ({ winnerName, totalPoints }) => {
  return (
    <div className="game-winner-container">
      <h1>🏆 Tournament Over! 🏆</h1>
      <h2>Congratulations, {winnerName}!</h2>
      <p>Total Points: {totalPoints}</p>
    </div>
  );
};

export default GameWinner;
