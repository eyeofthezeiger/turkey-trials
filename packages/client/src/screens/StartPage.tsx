import React, { useState, useEffect } from "react";
import { Client, Room } from "colyseus.js";

const SERVER_URL = "ws://localhost:2567"; // Replace with your Colyseus server URL

const StartPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("Not connected");
  const [players, setPlayers] = useState<{ id: string; name: string; color: string }[]>([]);
  const [playerName, setPlayerName] = useState<string>("Player");
  const [playerColor, setPlayerColor] = useState<string>("#0000ff");
  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    console.log("Current players in the lobby:", players);
  }, [players]);

  const connectToRoom = async () => {
    const client = new Client(SERVER_URL);
    try {
      const joinedRoom = await client.joinOrCreate("game_lobby", {
        name: playerName,
        color: playerColor,
      });
      setRoom(joinedRoom);
      setConnectionStatus(`Connected to room: ${joinedRoom.id}`);
      setupRoomListeners(joinedRoom);
    } catch (error) {
      console.error("Failed to connect to the room:", error);
      setConnectionStatus("Failed to connect");
    }
  };

  const setupRoomListeners = (joinedRoom: Room) => {
    // Listen for new players joining
    joinedRoom.onMessage("playerJoined", (data) => {
      setPlayers((prev) => [...prev, data]);
    });

    // Listen for host assignment
    joinedRoom.onMessage("hostAssigned", (data) => {
      if (data.hostId === joinedRoom.sessionId) {
        setIsHost(true);
        setConnectionStatus("You are the host!");
      }
    });

    // Listen for game start
    joinedRoom.onMessage("gameStarted", () => {
      setGameStarted(true);
      onStart();
    });

    // Synchronize game state for ongoing games
    joinedRoom.onMessage("gameState", (state) => {
      console.log("Synchronized with current game state:", state);
      setPlayers(state.players);
      setGameStarted(state.gameStarted);

      if (state.gameStarted) {
        setConnectionStatus("Game in progress. You have joined as a player.");
      }
    });

    // Handle room disconnection
    joinedRoom.onLeave(() => {
      setConnectionStatus("Disconnected");
      setRoom(null);
      setPlayers([]);
    });
  };

  const startGame = () => {
    if (isHost && room) {
      room.send("startGame");
    }
  };

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
          <input type="color" value={playerColor} onChange={(e) => setPlayerColor(e.target.value)} />
        </div>
      )}

      {/* Join Game Button */}
      <button onClick={connectToRoom} disabled={!!room} style={{ marginTop: "10px" }}>
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
                {player.name} - <span style={{ color: player.color }}>{player.color}</span>
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
