import React, { useState, useEffect } from "react";
import { Client, Room } from "colyseus.js";

const SERVER_URL = "ws://localhost:2567";

const PlayerScreen: React.FC = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [position, setPosition] = useState(0);
  const [light, setLight] = useState("Red");
  const [players, setPlayers] = useState<{ id: string; position: number }[]>([]);

  useEffect(() => {
    const client = new Client(SERVER_URL);
    const joinRoom = async () => {
      const joinedRoom = await client.joinOrCreate("red_light_green_light");
      setRoom(joinedRoom);

      joinedRoom.onMessage("lightToggled", (data) => setLight(data.light));
      joinedRoom.onMessage("playerMoved", (data) => {
        setPlayers((prev) =>
          prev.map((p) => (p.id === data.id ? { ...p, position: data.position } : p))
        );
      });
      joinedRoom.onMessage("playerJoined", (data) => {
        setPlayers((prev) => [...prev, { id: data.id, position: 0 }]);
      });
      joinedRoom.onMessage("playerLeft", (data) => {
        setPlayers((prev) => prev.filter((p) => p.id !== data.id));
      });
    };

    joinRoom();

    return () => {
      room?.leave();
    };
  }, []);

  const movePlayer = () => {
    if (room && light === "Green") {
      room.send("move");
      setPosition((prev) => prev + 10);
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
