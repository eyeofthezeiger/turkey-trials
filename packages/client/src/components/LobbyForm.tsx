// components/LobbyForm.tsx

import React, { useState } from "react";

interface LobbyFormProps {
  onJoin: (name: string, color: string) => void;
}

const LobbyForm: React.FC<LobbyFormProps> = ({ onJoin }) => {
  const [name, setName] = useState<string>("");
  const [color, setColor] = useState<string>("#000000"); // Default color

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoin(name.trim() || "Anonymous", color);
  };

  return (
    <form onSubmit={handleSubmit} className="lobby-form">
      <div>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>
      <div>
        <label htmlFor="color">Color:</label>
        <input
          id="color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          required
        />
      </div>
      <button type="submit">Join Lobby</button>
    </form>
  );
};

export default LobbyForm;
