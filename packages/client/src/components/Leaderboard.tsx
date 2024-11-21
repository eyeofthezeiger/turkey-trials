// components/Leaderboard.tsx

import React from "react";

interface LeaderboardProps {
  leaderboard: { id: string; points: number }[];
  players: { id: string; name: string; color: string }[];
  gameStarted: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, players, gameStarted }) => {
  // Merge leaderboard with player details
  const leaderboardWithDetails = leaderboard.map((entry) => {
    const player = players.find((p) => p.id === entry.id);
    return {
      ...entry,
      name: player ? player.name : "Unknown",
      color: player ? player.color : "#000000",
    };
  });

  return (
    <div className="leaderboard">
      <h3>Leaderboard</h3>
      <ol>
        {leaderboardWithDetails.map((entry, index) => (
          <li key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.points} points
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard;
