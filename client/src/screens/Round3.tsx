// Round3.tsx

import React from "react";
import SlidingPuzzle from "../components/SlidingPuzzle/SlidingPuzzle";

interface Round3Props {
  onAdvance: () => void;
}

const Round3: React.FC<Round3Props> = ({ onAdvance }) => {
  return (
    <div>
      <h1>Round 3: Sliding Block Puzzle</h1>
      <SlidingPuzzle /> {/* Sliding Block Puzzle game component */}
      <button onClick={onAdvance}>Complete Round 3</button>
    </div>
  );
};

export default Round3;
