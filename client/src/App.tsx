// App.tsx

import React from "react";
import GameBoard from "./GameBoard";
import RPSGameBoard from "./RPSGameBoard";
import SlidingPuzzle from "./SlidingPuzzle";

const App: React.FC = () => {
  return (
    <div>
      <GameBoard />
      <RPSGameBoard />
      <SlidingPuzzle />
    </div>
  );
};

export default App;
