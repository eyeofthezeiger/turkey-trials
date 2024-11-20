// components/Leaderboard.tsx

import React from "react";

interface LeaderboardProps {
  leaderboard: { id: string; points: number }[];
  gameStarted: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, gameStarted }) => {
  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>Player ID</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((player, index) => (
            <tr key={index}>
              <td>{player.id}</td>
              <td>{player.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
