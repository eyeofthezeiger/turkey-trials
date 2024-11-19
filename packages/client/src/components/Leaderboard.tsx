/* components/Leaderboard.tsx */
import React from "react";
import "./../App.css"; // Import the consolidated CSS file

interface LeaderboardProps {
  leaderboard: { id: string; points: number }[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard }) => {
  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player ID</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((player, index) => (
            <tr key={player.id}>
              <td>{index + 1}</td>
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
