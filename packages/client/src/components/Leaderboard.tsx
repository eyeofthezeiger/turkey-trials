// components/Leaderboard.tsx

import React from "react";

interface LeaderboardProps {
  leaderboard: { id: string; points: number }[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard }) => {
  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Leaderboard</h2>
      <table style={{ margin: "0 auto", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "8px" }}>Rank</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Player ID</th>
            <th style={{ border: "1px solid black", padding: "8px" }}>Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((player, index) => (
            <tr key={player.id}>
              <td style={{ border: "1px solid black", padding: "8px" }}>{index + 1}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{player.id}</td>
              <td style={{ border: "1px solid black", padding: "8px" }}>{player.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
