// App.tsx

import React, { useState } from "react";
import HostScreen from "./host/HostScreen";
import FinalRound from "./screens/FinalRound";
import Round1 from "./screens/Round1";
import Round2 from "./screens/Round2";
import Round3 from "./screens/Round3";
import StartPage from "./screens/StartPage";


const App: React.FC = () => {
  const [round, setRound] = useState(0);

  const advanceRound = () => setRound((prevRound) => prevRound + 1);

  return (
    <div style={{ textAlign: "center" }}>
      {round === 0 && <StartPage onStart={() => setRound(1)} />}
      {round === 1 && <Round1 onAdvance={advanceRound} />}
      {round === 2 && <Round2 onAdvance={advanceRound} />}
      {round === 3 && <Round3 onAdvance={advanceRound} />}
      {round === 4 && <FinalRound onWin={() => setRound(5)} />}
      {round === 5 && <h1>Congratulations! You've won the tournament!</h1>}

      <HostScreen currentRound={round} />
    </div>
  );
};

export default App;
