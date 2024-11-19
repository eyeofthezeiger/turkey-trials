import React, { useState, useEffect } from "react";
import { Room } from "colyseus.js";
import turkeyGobbleSound from "../assets/Turkey-gobble.mp3";
import turkeyScreechSound from "../assets/Turkey-noises.mp3";

interface Props {
  room: Room; // Pass the Colyseus room as a prop
}

const RedLightGreenLight: React.FC<Props> = ({ room }) => {
  const [light, setLight] = useState("Red");
  const [players, setPlayers] = useState<{ id: string; position: number }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [playerPoints, setPlayerPoints] = useState<number>(0);

  useEffect(() => {
    // Listen for state changes from the server
    room.onMessage("light_update", (data) => {
      console.log("[Client] Light updated to:", data.light);
      setLight(data.light);
    });

    room.onMessage("player_update", (data) => {
      console.log("[Client] Player updated:", data);
      setPlayers((prev) =>
        prev.map((player) =>
          player.id === data.id ? { ...player, position: data.position } : player
        )
      );
    });

    room.onMessage("player_joined", (data) => {
      console.log("[Client] Player joined:", data);
      setPlayers((prev) => [...prev, { id: data.playerId, position: 0 }]);
    });

    room.onMessage("player_left", (data) => {
      console.log("[Client] Player left:", data);
      setPlayers((prev) => prev.filter((player) => player.id !== data.playerId));
    });

    room.onMessage("player_finished", (data) => {
      console.log(`[Client] Player ${data.playerId} finished in position ${data.position}`);
    });

    room.onMessage("game_over", () => {
      console.log("[Client] Game over.");
      alert("Game over!");
      setGameOver(true);
    });

    // Listen for points updates
    room.onMessage("points_update", (data) => {
      const points = data.points[room.sessionId];
      if (points !== undefined) {
        setPlayerPoints(points);
      }
    });

    // Request initial points
    room.send("request_points");

    // Initial state sync
    const currentPlayers = [];
    room.state.players.forEach((player, key) => {
      currentPlayers.push({ id: key, position: player.position });
    });
    setPlayers(currentPlayers);

    // Listen for additions/removals
    room.state.players.onAdd = (player, key) => {
      console.log("[Client] Player added:", key);
      setPlayers((prev) => [...prev, { id: key, position: player.position }]);
    };

    room.state.players.onRemove = (player, key) => {
      console.log("[Client] Player removed:", key);
      setPlayers((prev) => prev.filter((p) => p.id !== key));
    };

    return () => {
      room.removeAllListeners();
    };
  }, [room]);

  const movePlayer = () => {
    if (light === "Green") {
      const gobbleAudio = new Audio(turkeyGobbleSound);
      gobbleAudio.play();
    } else {
      const screechAudio = new Audio(turkeyScreechSound);
      screechAudio.play();
    }
    room.send("rlgl_move");
  };

  return (
    <div>
      <h1>Red Light, Green Light</h1>
      <h3>Your Points: {playerPoints}</h3>
      <div
        style={{
          margin: "20px",
          padding: "10px",
          backgroundColor: light === "Green" ? "green" : "red",
          color: "white",
          textAlign: "center",
        }}
      >
        {light} Light
      </div>
      <div style={{ position: "relative", height: "300px", border: "1px solid black" }}>
        {players.map((player, index) => (
          <div
            key={player.id}
            style={{
              position: "absolute",
              top: 50 + index * 30,
              left: player.position,
              backgroundColor: "gray",
              width: "50px",
              height: "50px",
              lineHeight: "50px",
              textAlign: "center",
              color: "white",
            }}
          >
            {`Player ${player.id}`}
          </div>
        ))}
      </div>
      <button
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
        onClick={movePlayer}
        disabled={gameOver}
      >
        Move Player
      </button>
    </div>
  );
};

export default RedLightGreenLight;
