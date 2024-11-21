// components/Lobby.tsx

import React from "react";
import "./Lobby.css"; // Import the CSS file for the Lobby component

interface LobbyProps {
  onJoin: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ onJoin }) => {
  return (
    <div className="lobby-container">
      <header className="lobby-header">
        <h1>Welcome to Turkey Trials</h1>
      </header>
      <main className="lobby-body">
        <p>Join the lobby to get started.</p>
        <button className="join-button" onClick={onJoin}>
          Join Lobby
        </button>
      </main>
    </div>
  );
};

export default Lobby;
