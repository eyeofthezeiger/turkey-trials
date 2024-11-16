// StartPage.tsx

import React from "react";

interface StartPageProps {
  onStart: () => void;
}

const StartPage: React.FC<StartPageProps> = ({ onStart }) => {
  return (
    <div>
      <h1>Welcome to the Tournament!</h1>
      <button onClick={onStart}>Start Game</button>
    </div>
  );
};

export default StartPage;
