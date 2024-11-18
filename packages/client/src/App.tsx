import React, { useEffect, useState } from "react";
import { Client, Room } from "colyseus.js";
import RedLightGreenLight from "./components/RedLightGreenLight";
import SlidingPuzzle from "./components/SlidingPuzzle";
import TicTacToe from "./components/TicTacToe"; // Import your FinalRound component
import RockPaperScissors from "./components/RockPaperScissors";

type GamePageKey = "welcome" | "game1" | "game2" | "game3" | "final";

const client = new Client("ws://localhost:3000");

const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GamePageKey>("welcome");
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [inLobby, setInLobby] = useState<boolean>(false);

  useEffect(() => {
    const joinRoom = async () => {
      console.log("[Client] Attempting to join or create room...");
      try {
        const gameRoom = await client.joinOrCreate("game_room");
        setRoom(gameRoom);
        console.log("[Client] Joined room successfully!");

        // Log initial room state
        console.log(`[Client] Initial game state: ${gameRoom.state.currentGame}`);

        // Listen for game state changes
        gameRoom.onMessage("game_changed", (newGame: GamePageKey) => {
          console.log(`[Client] Game state changed to: ${newGame}`);
          setCurrentGame(newGame);
        });

        // Listen for player join/leave updates
        gameRoom.onMessage("player_joined", (data) => {
          console.log(`[Client] Player joined: ${data.playerId}`);
          setPlayers((prevPlayers) => [...prevPlayers, data.playerId]);
        });

        gameRoom.onMessage("player_left", (data) => {
          console.log(`[Client] Player left: ${data.playerId}`);
          setPlayers((prevPlayers) =>
            prevPlayers.filter((player) => player !== data.playerId)
          );
        });
      } catch (error) {
        console.error("[Client] Failed to join or create room:", error);
      }
    };

    joinRoom();
  }, []);

  const handleJoinLobby = () => {
    if (room) {
      console.log("[Client] Sending join lobby request...");
      room.send("join_lobby");
      setInLobby(true);
    }
  };

  const handleLeaveLobby = () => {
    if (room) {
      console.log("[Client] Sending leave lobby request...");
      room.send("leave_lobby");
      setInLobby(false);
    }
  };

  // Dynamically render the current game page
  const renderCurrentGame = () => {
    switch (currentGame) {
      case "welcome":
        return <h1>Welcome to the tournament</h1>;
      case "game1":
        return <RedLightGreenLight />;
      case "game2":
        return <TicTacToe />;
      case "game3":
        return <SlidingPuzzle />;
      case "final":
        return <RockPaperScissors />; // Render the FinalRound component
      default:
        return <h1>Page Not Found</h1>;
    }
  };

  return (
    <div>
      <nav>
        <button onClick={() => room?.send("change_game", "game1")}>
          Switch to Game 1
        </button>
        <button onClick={() => room?.send("change_game", "game2")}>
          Switch to Game 2
        </button>
        <button onClick={() => room?.send("change_game", "game3")}>
          Switch to Game 3
        </button>
        <button onClick={() => room?.send("change_game", "final")}>
          Go to Final Round
        </button>
        <button onClick={() => room?.send("change_game", "welcome")}>
          Go to Welcome
        </button>
      </nav>

      <main>{renderCurrentGame()}</main>

      <section>
        <h2>Lobby</h2>
        <div>
          {inLobby ? (
            <button onClick={handleLeaveLobby}>Leave Lobby</button>
          ) : (
            <button onClick={handleJoinLobby}>Join Lobby</button>
          )}
        </div>

        <h3>Players in Lobby:</h3>
        <ul>
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default App;
