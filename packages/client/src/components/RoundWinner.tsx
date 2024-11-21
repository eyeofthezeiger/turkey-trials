// components/RoundWinner.tsx

import React from "react";
import "./RoundWinner.css"; // Import the CSS file for styling

interface RoundWinnerProps {
  roundNumber: number;
  winnerName: string;
  secondPlace: string;
  thirdPlace: string;
}

const RoundWinner: React.FC<RoundWinnerProps> = ({
  roundNumber,
  winnerName,
  secondPlace,
  thirdPlace,
}) => {
  return (
    <div className="round-winner-container">
      <h1>Round {roundNumber} Over!</h1>
      <h2>🎉 {winnerName} is the Winner! 🎉</h2>
      <div className="runner-ups">
        <h3>🏅 2nd Place: {secondPlace}</h3>
        <h3>🥉 3rd Place: {thirdPlace}</h3>
      </div>
    </div>
  );
};

export default RoundWinner;
