import React, { useState, useEffect } from "react";
import { Client, Room } from "colyseus.js";

const SERVER_URL = "ws://localhost:2567"; // Replace with your Colyseus server URL

const StartPage: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>("Not connected");
  const [players, setPlayers] = useState<{ id: string; name: string; color: string }[]>([]);
  const [playerName, setPlayerName] = useState<string>("Player");
  const [playerColor, setPlayerColor] = useState<string>("#0000ff");

  useEffect(() => {
    console.log("Current players in the lobby:", players);
  }, [players]);
  

  // Function to connect to the single game lobby
  const connectToRoom = async () => {
    console.log("Connecting to the game lobby...");
    const client = new Client(SERVER_URL);

    try {
      const joinedRoom = await client.joinOrCreate("game_lobby", {
        name: playerName,
        color: playerColor,
      });
      console.log("Successfully joined the room:", joinedRoom);
      setRoom(joinedRoom);
      setConnectionStatus(`Connected to room: ${joinedRoom.id}`);

      // Set up listeners for room events
      setupRoomListeners(joinedRoom);
    } catch (error) {
      console.error("Failed to connect to the room:", error);
      setConnectionStatus("Failed to connect");
    }
  };

  // Function to set up room listeners
  const setupRoomListeners = (joinedRoom: Room) => {
    // Listen for new players joining
    joinedRoom.onMessage("playerJoined", (data) => {
      console.log("Player joined:", data);
      setPlayers((prev) => [...prev, data]);
    });
  
    // Listen for host assignment
    joinedRoom.onMessage("hostAssigned", (data) => {
      console.log("Host assigned:", data);
      if (data.hostId === joinedRoom.sessionId) {
        setConnectionStatus("You are the host!");
      }
    });
  
    // Listen for player updates
    joinedRoom.onMessage("playerUpdated", (data) => {
      console.log("Player updated:", data);
      setPlayers((prev) =>
        prev.map((player) =>
          player.id === data.id ? { ...player, name: data.name, color: data.color } : player
        )
      );
    });
  
    // Listen for player leaving
    joinedRoom.onMessage("playerLeft", (data) => {
      console.log("Player left:", data);
      setPlayers((prev) => prev.filter((player) => player.id !== data.id));
    });
  
    // Listen for room disposal
    joinedRoom.onLeave(() => {
      console.log("Left the room.");
      setConnectionStatus("Disconnected");
      setRoom(null);
      setPlayers([]);
    });
  };
  

  // Function to update player details
  const updatePlayerDetails = () => {
    if (room) {
      room.send("updatePlayer", { name: playerName, color: playerColor });
      console.log("Updated player details:", { name: playerName, color: playerColor });
    }
  };

  // Function to leave the room
  const leaveRoom = () => {
    if (room) {
      console.log("Leaving the room...");
      room.leave();
      setRoom(null);
      setConnectionStatus("Disconnected");
    } else {
      console.log("No active room to leave.");
    }
  };

  useEffect(() => {
    // Automatically try to reconnect to the existing room on page load
    connectToRoom();
  }, []);

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
      <input
        type="color"
        value={playerColor}
        onChange={(e) => setPlayerColor(e.target.value)}
      />
    </div>
  )}

  {/* Connect Button */}
  <button onClick={connectToRoom} disabled={!!room} style={{ marginTop: "10px" }}>
    {room ? "Connected" : "Join Game"}
  </button>

  {/* Leave Button */}
  {room && (
    <button onClick={leaveRoom} style={{ marginLeft: "10px" }}>
      Leave Room
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
