// // HostScreen.tsx

// import React, { useState } from "react";
// import { Room } from "colyseus.js";
// import { RedLightGreenLightRoomMessages } from "../types/types";

// interface HostScreenProps {
//   room: Room<RedLightGreenLightRoomMessages>;
// }

// const HostScreen: React.FC<HostScreenProps> = ({ room }) => {
//   const [light, setLight] = useState("Red");
//   const [automatic, setAutomatic] = useState(false);

//   room.onMessage("light", (message) => {
//     setLight(message.light);
//   });

//   const toggleLight = () => {
//     room.send("toggleLight");
//     console.log("Manual light toggle sent to the server.");
//   };

//   const toggleAutomaticMode = () => {
//     console.log(`Setting automatic mode to ${!automatic}`);
//     room.send("setAutomatic", !automatic);
//     setAutomatic(!automatic);
//   };

//   return (
//     <div style={{ textAlign: "center" }}>
//       <h1>Host Controls</h1>
//       <h2>Current Light: {light}</h2>
//       <button onClick={toggleLight} disabled={automatic}>
//         Toggle Light
//       </button>
//       <button onClick={toggleAutomaticMode}>
//         {automatic ? "Disable Automatic Mode" : "Enable Automatic Mode"}
//       </button>
//     </div>
//   );
// };

// export default HostScreen;

// HostScreen.tsx

import React from "react";

interface HostScreenProps {
  currentRound: number;
}

const HostScreen: React.FC<HostScreenProps> = ({ currentRound }) => {
  return (
    <div style={{ marginTop: "20px", borderTop: "1px solid gray", paddingTop: "10px" }}>
      <h2>Host Controls</h2>
      <p>Current Round: {currentRound}</p>
      {/* Placeholder for future controls and game management logic */}
    </div>
  );
};

export default HostScreen;

