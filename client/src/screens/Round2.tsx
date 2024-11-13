// Round2.tsx

import React from "react";
import GameBoard from "../components/TicTacToe/GameBoard";

interface Round2Props {
  onAdvance: () => void;
}

const Round2: React.FC<Round2Props> = ({ onAdvance }) => {
  return (
    <div>
      <h1>Round 2: Tic Tac Toe</h1>
      <GameBoard /> {/* Tic Tac Toe game component */}
      <button onClick={onAdvance}>Complete Round 2</button>
    </div>
  );
};

export default Round2;
