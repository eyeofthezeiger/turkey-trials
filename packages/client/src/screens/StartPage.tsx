import React, { useState, useEffect, useCallback } from "react";
import { useClient } from "../utils/client";

const StartPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { room, connectionStatus, connectToRoom } = useClient();
  const [players, setPlayers] = useState<
    { id: string; name: string; color: string }[]
  >([]);
  const [playerName, setPlayerName] = useState<string>("Player");
  const [playerColor, setPlayerColor] = useState<string>("#0000ff");
  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    console.log("Current players in the lobby:", players);
  }, [players]);

  const setupRoomListeners = useCallback(() => {
    if (!room) {
      return;
    }
    // Listen for new players joining
    room.onMessage("playerJoined", (data) => {
      setPlayers((prev) => [...prev, data]);
    });

    // Listen for host assignment
    room.onMessage("hostAssigned", (data) => {
      if (data.hostId === room.sessionId) {
        setIsHost(true);
      }
    });

    // Listen for game start
    room.onMessage("gameStarted", () => {
      setGameStarted(true);
      onStart();
    });

    // Synchronize game state for ongoing games
    room.onMessage("gameState", (state) => {
      console.log("Synchronized with current game state:", state);
      setPlayers(state.players);
      setGameStarted(state.gameStarted);
    });
  }, [onStart, room]);

  const handleJoin = useCallback(() => {
    if (!room) {
      connectToRoom(playerName, playerColor);
    }
  }, [connectToRoom, playerColor, playerName, room]);

  const startGame = () => {
    if (isHost && room) {
      room.send("startGame");
    }
  };

  useEffect(() => {
    if (room !== null) {
      setupRoomListeners();
    }
  }, [room, setupRoomListeners]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Welcome to the Tournament!</h1>
      <p>Status: {connectionStatus}</p>

      {/* Input for player name and color */}
      {!room && (
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <input
            type="color"
            value={playerColor}
            onChange={(e) => setPlayerColor(e.target.value)}
          />
        </div>
      )}

      {/* Join Game Button */}
      <button
        onClick={handleJoin}
        disabled={!!room}
        style={{ marginTop: "10px" }}
      >
        {room ? "Connected" : "Join Game"}
      </button>

      {/* Start Game Button for Host */}
      {isHost && !gameStarted && (
        <button onClick={startGame} style={{ marginLeft: "10px" }}>
          Start Game
        </button>
      )}

      {/* Players in Room */}
      {room && (
        <div style={{ marginTop: "20px" }}>
          <h2>Players in Room:</h2>
          <ul>
            {players.map((player) => (
              <li key={player.id}>
                {player.name} -{" "}
                <span style={{ color: player.color }}>{player.color}</span>
                {room.sessionId === player.id && " (You)"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StartPage;
