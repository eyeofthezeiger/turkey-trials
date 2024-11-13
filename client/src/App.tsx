// App.tsx

import React from "react";
import GameBoard from "./GameBoard";
import RPSGameBoard from "./RPSGameBoard";
import SlidingPuzzle from "./SlidingPuzzle";
import PlayerScreen from "./PlayerScreen";
import HostScreen from "./HostScreen";
import { useRoom } from "./useRoom";

const App: React.FC = () => {
  const room = useRoom("red_light_green_light"); // Use your room name here

  return (
    <div>
      <GameBoard />
      <RPSGameBoard />
      <SlidingPuzzle />
      <PlayerScreen />
      {/* Pass the room to PlayerScreen and HostScreen */}
      {/* {room && (
        <>
          <PlayerScreen room={room} />
          <HostScreen room={room} />
        </>
      )} */}
    </div>
  );
};

export default App;
