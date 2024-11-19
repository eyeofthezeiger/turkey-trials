/* eslint-disable */
/* App.tsx */
import React, { useEffect, useState } from "react";
import { Client, Room } from "colyseus.js";
import RedLightGreenLight from "./components/RedLightGreenLight";
import SlidingPuzzle from "./components/SlidingPuzzle";
import TicTacToe from "./components/TicTacToe";
import RockPaperScissors from "./components/RockPaperScissors";
import Leaderboard from "./components/Leaderboard";
import "./App.css"; // Import the consolidated CSS file

type GamePageKey = "welcome" | "game1" | "game2" | "game3" | "final" | "tournament_over";

const serverUrl =
  process.env.NODE_ENV === "production"
    ? "wss://turkey-trials.onrender.com" // Replace with your actual Render URL
    : "ws://localhost:3000";

const client = new Client(serverUrl);

const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GamePageKey>("welcome");
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [inLobby, setInLobby] = useState<boolean>(false);

  const [playerPoints, setPlayerPoints] = useState<{ [key: string]: number }>({});
  const [leaderboard, setLeaderboard] = useState<{ id: string; points: number }[]>([]);

  interface PointsUpdateMessage {
    points: { [key: string]: number };
  }

  useEffect(() => {
    const joinRoom = async () => {
      console.log("[Client] Attempting to join or create room...");
      try {
        const gameRoom = await client.joinOrCreate("game_room");
        setRoom(gameRoom);
        console.log("[Client] Joined room successfully!");

        // Log initial room state
        console.log(`[Client] Initial game state: ${gameRoom.state.currentGame}`);
        setCurrentGame(gameRoom.state.currentGame);

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

        // Listen for points updates
        gameRoom.onMessage("points_update", (data: PointsUpdateMessage) => {
          console.log("[Client] Points update:", data.points);
          setPlayerPoints(data.points);

          // Update leaderboard
          const leaderboardData = Object.entries(data.points).map(([id, points]) => ({
            id,
            points,
          }));
          leaderboardData.sort((a, b) => b.points - a.points);
          setLeaderboard(leaderboardData);
        });

        // Request initial points
        gameRoom.send("request_points");
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

  const renderCurrentGame = () => {
    if (currentGame === "tournament_over") {
      // Tournament is over, display final leaderboard and winner
      return (
        <div style={{ textAlign: "center" }}>
          <h1>Tournament Over</h1>
          <h2>
            Winner: {leaderboard[0]?.id} with {leaderboard[0]?.points} points!
          </h2>
          <Leaderboard leaderboard={leaderboard} />
        </div>
      );
    }

    switch (currentGame) {
      case "welcome":
        return <h1>Welcome to the tournament</h1>;
      case "game1":
        return <RedLightGreenLight room={room!} />;
      case "game2":
        return <TicTacToe room={room!} />;
      case "game3":
        return <SlidingPuzzle room={room!} />;
      case "final":
        return <RockPaperScissors room={room!} />;
      default:
        return <h1>Page Not Found</h1>;
    }
  };

  return (
    <div>
      <nav className="navigation">
        <button onClick={() => room?.send("change_game", "game1")}>Game 1</button>
        <button onClick={() => room?.send("change_game", "game2")}>Game 2</button>
        <button onClick={() => room?.send("change_game", "game3")}>Game 3</button>
        <button onClick={() => room?.send("change_game", "final")}>Final Round</button>
        <button onClick={() => room?.send("change_game", "tournament_over")}>
          End Tournament
        </button>
        <button onClick={() => room?.send("change_game", "welcome")}>Welcome</button>
      </nav>

      <main>{renderCurrentGame()}</main>

      <Leaderboard leaderboard={leaderboard} />

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
