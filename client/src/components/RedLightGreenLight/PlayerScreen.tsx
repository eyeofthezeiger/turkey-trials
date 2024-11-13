// PlayerScreen.tsx

import React, { useEffect, useState } from "react";

const PlayerScreen: React.FC = () => {
  const [position, setPosition] = useState(0); // Player's position
  const [light, setLight] = useState("Red"); // Light state (Red/Green)
  const [winner, setWinner] = useState<string | null>(null); // Win condition

  useEffect(() => {
    // Simulate automatic light change every 3-5 seconds
    const lightInterval = setInterval(() => {
      setLight((prevLight) => (prevLight === "Red" ? "Green" : "Red"));
    }, Math.random() * 3000 + 2000); // Random interval between 2-5 seconds

    return () => {
      clearInterval(lightInterval); // Clean up the interval on unmount
    };
  }, []);

  const movePlayer = () => {
    if (light === "Green") {
      setPosition((prevPosition) => prevPosition + 10); // Move player forward by 10
    } else {
      setPosition(0); // Reset player position to 0 if clicked during red light
    }
  };

  useEffect(() => {
    if (position >= 500) {
      setWinner("You won!"); // If player reaches position 100, they win
    }
  }, [position]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Red Light, Green Light</h1>

      {/* Colored Light Box */}
      <div
        style={{
          margin: "20px",
          padding: "10px 20px",
          backgroundColor: light === "Green" ? "green" : "red",
          color: "white",
          fontSize: "24px",
          borderRadius: "5px",
        }}
      >
        {light} Light
      </div>

      {winner ? (
        <h2>{winner}</h2>
      ) : (
        <button onClick={movePlayer}>
          {light === "Green" ? "Move Forward" : "Stop!"}
        </button>
      )}

      <div
        style={{
          marginTop: "20px",
          width: "50px",
          height: "50px",
          backgroundColor: "blue",
          transform: `translateX(${position}px)`, // Player's movement on X-axis
        }}
      ></div>
    </div>
  );
};

export default PlayerScreen;
