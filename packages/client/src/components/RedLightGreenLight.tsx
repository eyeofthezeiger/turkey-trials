// components/RedLightGreenLight.tsx

import React, { useState, useEffect } from "react";
import { Room } from "colyseus.js";
import "./../App.css"; // Import the consolidated CSS file

interface Props {
  room: Room; // Pass the Colyseus room as a prop
  isHost: boolean; // Add isHost prop
}

interface PlayerInfo {
  id: string;
  name: string;
  color: string;
  position: number;
}

const RedLightGreenLight: React.FC<Props> = ({ room, isHost }) => {
  const [light, setLight] = useState("Red");
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [playerPoints, setPlayerPoints] = useState<number>(0);

  interface PointsUpdateMessage {
    points: { [key: string]: number };
  }

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

    room.onMessage("player_joined", (data: { player: PlayerInfo }) => {
      console.log("[Client] Player joined:", data.player);
      setPlayers((prev) => [...prev, data.player]);
    });

    room.onMessage("player_left", (data: { playerId: string }) => {
      console.log("[Client] Player left:", data.playerId);
      setPlayers((prev) => prev.filter((player) => player.id !== data.playerId));
    });

    room.onMessage("player_finished", (data) => {
      console.log(`[Client] Player ${data.playerId} finished in position ${data.position}`);
    });

    room.onMessage("round_over", () => {
      console.log("[Client] Round over.");
      alert("Round over!");
      setGameOver(true);
    });

    room.onMessage("game_over", () => {
      console.log("[Client] Game over.");
      alert("Game over!");
      setGameOver(true);
    });

    // Listen for points updates
    room.onMessage("points_update", (data: PointsUpdateMessage) => {
      const points = data.points[room.sessionId];
      if (points !== undefined) {
        setPlayerPoints(points);
      }
    });

    // Request initial points
    room.send("request_points");

    // Initial state sync
    const currentPlayers: PlayerInfo[] = [];
    room.state.players.forEach((player, key) => {
      currentPlayers.push({
        id: key,
        name: player.name,
        color: player.color,
        position: player.position,
      });
    });
    setPlayers(currentPlayers);

    // Listen for additions/removals
    room.state.players.onAdd = (player, key) => {
      console.log("[Client] Player added:", key);
      setPlayers((prev) => [
        ...prev,
        {
          id: key,
          name: player.name,
          color: player.color,
          position: player.position,
        },
      ]);
    };

    room.state.players.onRemove = (player, key) => {
      console.log("[Client] Player removed:", key);
      setPlayers((prev) => prev.filter((p) => p.id !== key));
    };
  }, [room]);

  const movePlayer = () => {
    room.send("rlgl_move");
  };

  const endRound = () => {
    room.send("end_round");
  };

  return (
    <div className="red-light-green-light" style={{ backgroundColor: 'grey', minHeight: '100vh', padding: '20px' }}>
      <h1>Red Light, Green Light</h1>
      <h3>Your Points: {playerPoints}</h3>
      <div
        className="light-indicator"
        style={{
          backgroundColor: light === "Green" ? "#00FF00" : "#FF0000",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          margin: "20px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "1.5rem",
        }}
      >
        {light} Light
      </div>
      <div className="game-area" style={{ position: 'relative', height: '200px', border: '1px solid #000', backgroundColor: '#ccc' }}>
        {players.map((player, index) => (
          <div
            key={player.id}
            className="player"
            style={{
              position: 'absolute',
              top: `${50 + index * 30}px`,
              left: `${player.position}px`,
              color: player.color,
              fontWeight: 'bold',
            }}
          >
            {player.name}
          </div>
        ))}
      </div>
      <button className="move-button" onClick={movePlayer} disabled={gameOver} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
        Move Player
      </button>
      {isHost && !gameOver && (
        <button className="end-round-button" onClick={endRound} style={{ marginTop: '10px', padding: '10px 20px', fontSize: '16px' }}>
          End Round
        </button>
      )}
    </div>
  );
};

export default RedLightGreenLight;
