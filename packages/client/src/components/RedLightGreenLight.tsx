import React, { useState, useEffect } from "react";
import turkeyGobbleSound from "../assets/Turkey-gobble.mp3";
import turkeyScreechSound from "../assets/Turkey-noises.mp3";

const RedLightGreenLight: React.FC = () => {
  const [light, setLight] = useState("Red");
  const [players, setPlayers] = useState<{ id: string; position: number }[]>([
    { id: "player1", position: 0 },
  ]);
  const [gameRunning, setGameRunning] = useState(true);

  // Randomly toggle the light between Red and Green
  useEffect(() => {
    if (!gameRunning) return;
    const interval = setInterval(() => {
      setLight((prevLight) => (prevLight === "Red" ? "Green" : "Red"));
    }, Math.random() * 3000 + 2000); // 2-5 seconds

    return () => clearInterval(interval);
  }, [gameRunning]);

  // Move the player forward when clicking "Move"
  const movePlayer = (playerId: string) => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        if (player.id === playerId) {
          if (light === "Green") {
            const newPosition = player.position + 50;
            if (newPosition >= 500) {
              alert("You won!");
              setGameRunning(false);
              return { ...player, position: newPosition };
            }
            const gobbleAudio = new Audio(turkeyGobbleSound);
            gobbleAudio.play();
            return { ...player, position: newPosition };
          } else {
            const screechAudio = new Audio(turkeyScreechSound);
            screechAudio.play();
            return { ...player, position: 0 }; // Reset to start on "Red"
          }
        }
        return player;
      })
    );
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
          textAlign: "center",
        }}
      >
        {light} Light
      </div>
      <div style={{ position: "relative", height: "300px" }}>
        {players.map((player) => (
          <div
            key={player.id}
            style={{
              position: "absolute",
              top: 50 + players.indexOf(player) * 30,
              left: player.position,
              backgroundColor: "gray",
              width: "50px",
              height: "50px",
              lineHeight: "50px",
              textAlign: "center",
              color: "white",
            }}
          >
            {`Player ${players.indexOf(player) + 1}`}
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
        onClick={() => movePlayer("player1")}
        disabled={!gameRunning}
      >
        Move Player
      </button>
    </div>
  );
};

export default RedLightGreenLight;
