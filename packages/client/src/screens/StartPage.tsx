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
    joinedRoom.onMessage("playerJoined", (data) => {
      setPlayers((prev) => [...prev, data]);
    });

    joinedRoom.onMessage("hostAssigned", (data) => {
      if (data.hostId === joinedRoom.sessionId) {
        setIsHost(true);
        setConnectionStatus("You are the host!");
      }
    });

    joinedRoom.onMessage("gameStarted", () => {
      onStart();
    });

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

      <button onClick={connectToRoom} disabled={!!room} style={{ marginTop: "10px" }}>
        {room ? "Connected" : "Join Game"}
      </button>

      {isHost && (
        <button onClick={startGame} style={{ marginLeft: "10px" }}>
          Start Game
        </button>
      )}

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
