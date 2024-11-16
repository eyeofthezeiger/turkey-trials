// FinalRound.tsx

import React from "react";
import RPSGameBoard from "../components/RockPaperScissors/RPSGameBoard";

interface FinalRoundProps {
  onWin: () => void;
}

const FinalRound: React.FC<FinalRoundProps> = ({ onWin }) => {
  return (
    <div>
      <h1>Final Round: Rock, Paper, Scissors</h1>
      <RPSGameBoard /> {/* Rock, Paper, Scissors game component */}
      <button onClick={onWin}>Win Final Round</button>
    </div>
  );
};

export default FinalRound;
