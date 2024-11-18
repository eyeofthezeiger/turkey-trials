import React, { useState, useEffect } from "react";
import { Client, Room } from "colyseus.js";
import turkeyGobbleSound from "../../assets/Turkey-gobble.mp3"; // Adjust path as needed
import turkeyScreechSound from "../../assets/Turkey-noises.mp3"; // Adjust path as needed

const SERVER_URL = "ws://localhost:2567";

const PlayerScreen: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [light, setLight] = useState("Red");
  const [players, setPlayers] = useState<{ id: string; position: number }[]>([]);

  useEffect(() => {
    const client = new Client(SERVER_URL);
    const joinRoom = async () => {
      try {
        const joinedRoom = await client.joinOrCreate("red_light_green_light");
        console.log(`[CLIENT] Connected to room: ${joinedRoom.id}`);
        setRoom(joinedRoom);

        joinedRoom.onMessage("lightToggled", (data) => {
          console.log(`[CLIENT] Light toggled to: ${data.light}`);
          setLight(data.light);
        });

        joinedRoom.onMessage("playerMoved", (data) => {
          console.log(`[CLIENT] Player moved:`, data);
          setPlayers((prev) =>
            prev.map((p) => (p.id === data.id ? { ...p, position: data.position } : p))
          );
        });

        joinedRoom.onMessage("playerJoined", (data) => {
          console.log(`[CLIENT] Player joined: ${data.id}`);
          setPlayers((prev) => [...prev, { id: data.id, position: 0 }]);
        });

        joinedRoom.onMessage("playerLeft", (data) => {
          console.log(`[CLIENT] Player left: ${data.id}`);
          setPlayers((prev) => prev.filter((p) => p.id !== data.id));
        });
      } catch (error) {
        console.error(`[CLIENT] Error joining room:`, error);
      }
    };

    joinRoom();

    return () => {
      console.log(`[CLIENT] Leaving room`);
      room?.leave();
    };
  }, []);

  const movePlayer = () => {
    console.log(`[CLIENT] Attempting to move. Current light: ${light}`);
    if (room) {
      if (light === "Green") {
        console.log(`[CLIENT] Sending move message to server.`);
        const gobbleAudio = new Audio(turkeyGobbleSound);
        gobbleAudio.play(); // Play turkey gobble sound
        room.send("move");
      } else {
        room.send("move")
        console.log(`[CLIENT] Attempted to move during Red light.`);
        const screechAudio = new Audio(turkeyScreechSound);
        screechAudio.play(); // Play turkey screech sound
      }
    }
  };

  return (
    <div>
      <h1>Red Light, Green Light</h1>
      <div
        style={{
          margin: "20px",
          padding: "10px",
          backgroundColor: light === "Green" ? "green" : "red",
          color: "white",
        }}
      >
        {light} Light
      </div>
      <button onClick={movePlayer}>Move</button>
      <div style={{ position: "relative", height: "300px" }}>
        {players.map((player) => (
          <div
            key={player.id}
            style={{
              position: "absolute",
              top: 50 + players.indexOf(player) * 30,
              left: player.position,
              backgroundColor: player.id === room?.sessionId ? "blue" : "gray",
              width: "50px",
              height: "50px",
            }}
          >
            {player.id === room?.sessionId ? "YOU" : `Player ${players.indexOf(player) + 1}`}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerScreen;
