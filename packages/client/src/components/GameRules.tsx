// components/GameRules.tsx

import React from "react";
import "./GameRules.css";

const GameRules: React.FC = () => {
  return (
    <div className="game-rules">
      <h2>Game Rules & Point Structure</h2>
      <ul>
        <li>Each round consists of Red Light Green Light and a final puzzle.</li>
        <li>A correct action awards 10 points.</li>
        <li>First place: 50 points, Second place: 30 points, Third place: 20 points.</li>
        <li>The player with the highest points at the end wins the tournament!</li>
      </ul>
    </div>
  );
};

export default GameRules;
