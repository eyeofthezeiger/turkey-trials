// components/RedLightGreenLight.tsx

import React, { useState, useEffect } from "react";
import { Room } from "colyseus.js";
import "./RedLightGreenLight.css"; // Import the CSS file for styling

interface Props {
  room: Room; // Pass the Colyseus room as a prop
  isHost: boolean; // Add isHost prop
}

interface PlayerInfo {
  id: string;
  name: string;
  color: string;
  position: number;
  hasFinished: boolean; // Ensure this is included
}

const RedLightGreenLight: React.FC<Props> = ({ room, isHost }) => {
  const [light, setLight] = useState("Red");
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [playerPoints, setPlayerPoints] = useState<number>(0);
  const [finishedPlayers, setFinishedPlayers] = useState<Set<string>>(new Set());
  const [finishLine, setFinishLine] = useState<number>(500); // Default value
  const [showFinishedIndicator, setShowFinishedIndicator] = useState<boolean>(false);

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
          player.id === data.id
            ? { ...player, position: data.position }
            : player
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
      setFinishedPlayers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.playerId);
        return newSet;
      });
    });

    room.onMessage("player_finished", (data) => {
      console.log(`[Client] Player ${data.playerId} finished in position ${data.position}`);
      setFinishedPlayers((prev) => new Set(prev).add(data.playerId));

      // Check if the finished player is the local player
      if (data.playerId === room.sessionId) {
        setShowFinishedIndicator(true);
      }
    });

    room.onMessage("round_over", (data: { round: number; winnerName: string; secondPlace: string; thirdPlace: string }) => {
      console.log("[Client] Round over.");
      setGameOver(true);
      // RoundWinner component will handle displaying the results
    });

    room.onMessage("game_over", (data: { winnerName: string; totalPoints: number }) => {
      console.log("[Client] Game over.");
      setGameOver(true);
      // GameWinner component will handle displaying the results
    });

    // Listen for points updates
    room.onMessage("points_update", (data: PointsUpdateMessage) => {
      const points = data.points[room.sessionId];
      if (points !== undefined) {
        setPlayerPoints(points);
      }
    });

    // Listen for finish line updates
    room.onMessage("game_changed", (newGame: string) => {
      if (newGame.startsWith("rlgl_round")) {
        const roundNumber = parseInt(newGame.replace("rlgl_round", ""));
        // Optionally, adjust finishLine based on roundNumber
        // For simplicity, using the same finishLine
      }
    });

    // Listen for game state updates (e.g., finishLine)
    const syncFinishLine = () => {
      if (room.state.finishLine) {
        setFinishLine(room.state.finishLine);
      }
    };

    syncFinishLine(); // Initial sync

    room.state.onChange = () => {
      syncFinishLine();
    };

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
        hasFinished: player.hasFinished,
      });
    });
    setPlayers(currentPlayers);
    setFinishLine(room.state.finishLine);

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
          hasFinished: player.hasFinished,
        },
      ]);
    };

    room.state.players.onRemove = (player, key) => {
      console.log("[Client] Player removed:", key);
      setPlayers((prev) => prev.filter((p) => p.id !== key));
      setFinishedPlayers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    };
  }, [room]);

  useEffect(() => {
    let flashTimer: NodeJS.Timeout;

    if (showFinishedIndicator) {
      flashTimer = setInterval(() => {
        setShowFinishedIndicator((prev) => !prev);
      }, 500); // Toggle every 500ms for flashing effect
    }

    return () => {
      if (flashTimer) {
        clearInterval(flashTimer);
      }
    };
  }, [showFinishedIndicator]);

  const movePlayer = () => {
    room.send("rlgl_move");
  };

  const endRound = () => {
    room.send("end_round");
  };

  // Determine if the local player has finished
  const localPlayer = players.find((player) => player.id === room.sessionId);
  const hasLocalPlayerFinished = localPlayer ? localPlayer.hasFinished : false;

  return (
    <div
      className="red-light-green-light"
      style={{
        backgroundColor: 'grey',
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1>Red Light, Green Light</h1>
      <h3>Your Points: {playerPoints}</h3>

      {/* Flashing "Finished" Indicator */}
      {hasLocalPlayerFinished && (
        <div className={`finished-indicator ${showFinishedIndicator ? 'visible' : 'hidden'}`}>
          Finished
        </div>
      )}

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
      <div
        className="game-area"
        style={{
          position: 'relative',
          width: '80%',
          height: '300px',
          border: '2px solid #000',
          backgroundColor: '#ccc',
          marginBottom: '20px',
        }}
      >
        {/* Finish Line Indicator */}
        <div
          className="finish-line"
          style={{
            position: 'absolute',
            top: 0,
            left: `${finishLine}px`,
            width: '4px',
            height: '100%',
            backgroundColor: 'yellow',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <span style={{ transform: 'rotate(-90deg)', backgroundColor: 'yellow', padding: '2px', fontWeight: 'bold' }}>Finish</span>
        </div>

        {/* Players */}
        {players.map((player, index) => (
          <div
            key={player.id}
            className="player"
            style={{
              position: 'absolute',
              top: `${50 + index * 50}px`,
              left: `${player.position}px`,
              color: player.color,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Finished Indicator */}
            {finishedPlayers.has(player.id) && (
              <span
                style={{
                  marginRight: '5px',
                  color: 'gold',
                  fontSize: '1.2rem',
                }}
              >
                🏁
              </span>
            )}
            {player.name}
          </div>
        ))}
      </div>
      <div>
        <button
          className="move-button"
          onClick={movePlayer}
          disabled={gameOver || hasLocalPlayerFinished}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: (gameOver || hasLocalPlayerFinished) ? 'not-allowed' : 'pointer',
          }}
        >
          Move Player
        </button>
        {isHost && !gameOver && (
          <button
            className="end-round-button"
            onClick={endRound}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            End Round
          </button>
        )}
      </div>
    </div>
  );
};

export default RedLightGreenLight;
