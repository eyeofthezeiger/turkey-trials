// App.tsx

import React from "react";
import GameBoard from "./GameBoard";
import RPSGameBoard from "./RPSGameBoard";

const App: React.FC = () => {
  return (
    <div>
      <GameBoard />
      <RPSGameBoard />
    </div>
  );
};

export default App;
