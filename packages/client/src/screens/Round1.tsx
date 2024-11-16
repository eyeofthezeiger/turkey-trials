// Round1.tsx

import React from "react";
import PlayerScreen from "../components/RedLightGreenLight/PlayerScreen";

interface Round1Props {
  onAdvance: () => void;
}

const Round1: React.FC<Round1Props> = ({ onAdvance }) => {
  return (
    <div>
      <h1>Round 1: Red Light, Green Light</h1>
      <PlayerScreen /> {/* Red Light, Green Light game component */}
      <button onClick={onAdvance}>Complete Round 1</button>
    </div>
  );
};

export default Round1;
