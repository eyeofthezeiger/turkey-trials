// App.tsx

import React, { useState, useEffect } from "react";
import { Client, Room } from "colyseus.js";
import RedLightGreenLight from "./components/RedLightGreenLight";
import SlidingPuzzle from "./components/SlidingPuzzle";
import Leaderboard from "./components/Leaderboard";
import "./App.css"; // Import the consolidated CSS file

type GamePageKey =
  | "welcome"
  | "rlgl_round1"
  | "rlgl_round2"
  | "rlgl_round3"
  | "final_puzzle"
  | "tournament_over";

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

  const [playerPoints, setPlayerPoints] = useState<{
    [key: string]: number;
  }>({});
  const [leaderboard, setLeaderboard] = useState<
    { id: string; points: number }[]
  >([]);

  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [nextGame, setNextGame] = useState<GamePageKey | null>(null);
  const [countdown, setCountdown] = useState<number>(10);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [hostId, setHostId] = useState<string | null>(null);

  const gameStarted =
    currentGame !== "welcome" && currentGame !== "tournament_over";

  interface PointsUpdateMessage {
    points: { [key: string]: number };
  }

  // Helper function to derive currentRound from currentGame
  const getCurrentRound = (): number => {
    if (currentGame.startsWith("rlgl_round")) {
      const roundNumber = parseInt(currentGame.replace("rlgl_round", ""));
      return isNaN(roundNumber) ? 0 : roundNumber;
    }
    return 0; // 0 indicates no active RLGL round
  };

  const currentRound = getCurrentRound();

  const handleJoinLobby = async () => {
    console.log("[Client] Attempting to join or create room...");
    try {
      const gameRoom = await client.joinOrCreate("game_room");
      setRoom(gameRoom);
      console.log("[Client] Joined room successfully!");
      console.log({ gameRoom });

      // Set the initial game state
      setCurrentGame(gameRoom.state.currentGame || "welcome");

      // Send the join lobby message to the server
      console.log("[Client] Sending join lobby request...");
      gameRoom.send("join_lobby");
      setInLobby(true);

      // Request initial points after joining the lobby
      gameRoom.send("request_points");
    } catch (error) {
      console.error(
        "[Client] Failed to join or create room:",
        error instanceof Error ? error.message : error
      );
    }
  };

  const handleLeaveLobby = () => {
    if (room) {
      console.log("[Client] Sending leave lobby request...");
      room.send("leave_lobby");
      setInLobby(false);

      // Clear lobby-related data
      setPlayers([]);
      setLeaderboard([]);
      setPlayerPoints({});
      setCurrentGame("welcome");

      // Leave the room
      room.leave();
      setRoom(null);
      setIsHost(false); // Reset host status
      setHostId(null);
    }
  };

  // Set up event listeners when room is available
  useEffect(() => {
    if (!room) return;

    console.log("[Client] Setting up event listeners");

    // Define event handlers
    const onGameChanged = (newGame: GamePageKey) => {
      console.log(`[Client] Received game_changed: ${newGame}`);

      // Start transition
      setNextGame(newGame);
      setIsTransitioning(true);
      setCountdown(10); // Start countdown from 10 seconds
    };

    const onPlayerJoined = (data: { playerId: string }) => {
      console.log(`[Client] Player joined: ${data.playerId}`);
      setPlayers((prevPlayers) => [...prevPlayers, data.playerId]);

      // Update leaderboard to include the new player with 0 points if not already present
      setLeaderboard((prevLeaderboard) => {
        const playerExists = prevLeaderboard.some(
          (p) => p.id === data.playerId
        );
        if (!playerExists) {
          return [...prevLeaderboard, { id: data.playerId, points: 0 }];
        }
        return prevLeaderboard;
      });
    };

    const onPlayerLeft = (data: { playerId: string }) => {
      console.log(`[Client] Player left: ${data.playerId}`);
      setPlayers((prevPlayers) =>
        prevPlayers.filter((player) => player !== data.playerId)
      );

      // Remove player from leaderboard
      setLeaderboard((prevLeaderboard) =>
        prevLeaderboard.filter((player) => player.id !== data.playerId)
      );
    };

    const onPointsUpdate = (data: PointsUpdateMessage) => {
      console.log("[Client] Points update:", data.points);
      setPlayerPoints(data.points);

      // Update leaderboard
      const leaderboardData = Object.entries(data.points).map(
        ([id, points]) => ({
          id,
          points,
        })
      );
      leaderboardData.sort((a, b) => b.points - a.points);
      setLeaderboard(leaderboardData);
    };

    const onLightUpdate = (lightState: string) => {
      console.log(`[Client] Light updated to: ${lightState}`);
    };

    const onWaitingForMatch = () => {
      console.log("[Client] Waiting for an opponent...");
      setIsTransitioning(false);
      setCurrentGame("final_puzzle");
    };

    const onTimerUpdate = (timeLeft: number) => {
      console.log(`[Client] Timer update: ${timeLeft} seconds left`);
    };

    const onHostAssigned = (data: { hostId: string }) => {
      setHostId(data.hostId);
      if (room.sessionId === data.hostId) {
        setIsHost(true);
        console.log("[Client] You are the host.");
      } else {
        setIsHost(false);
        console.log(`[Client] Host is ${data.hostId}.`);
      }
    };

    const onGameOver = () => {
      setCurrentGame("tournament_over");
    };

    const onRoundOver = (data: { round: number }) => {
      console.log(`[Client] Round ${data.round} has ended.`);
      // Optionally, notify the host or update the UI accordingly
      // For example, you can prompt the host to start the next round
    };

    // Attach event listeners
    room.onMessage("game_changed", onGameChanged);
    room.onMessage("player_joined", onPlayerJoined);
    room.onMessage("player_left", onPlayerLeft);
    room.onMessage("points_update", onPointsUpdate);
    room.onMessage("light_update", onLightUpdate);
    room.onMessage("waiting_for_match", onWaitingForMatch);
    // room.onMessage("new_puzzle", onNewPuzzle); // Removed as images are handled on client
    room.onMessage("timer_update", onTimerUpdate);
    room.onMessage("host_assigned", onHostAssigned);
    room.onMessage("game_over", onGameOver);
    room.onMessage("round_over", onRoundOver); // Optional

    // Cleanup listeners on component unmount or room change
    return () => {
      room.off("game_changed", onGameChanged);
      room.off("player_joined", onPlayerJoined);
      room.off("player_left", onPlayerLeft);
      room.off("points_update", onPointsUpdate);
      room.off("light_update", onLightUpdate);
      room.off("waiting_for_match", onWaitingForMatch);
      // room.off("new_puzzle", onNewPuzzle); // Removed
      room.off("timer_update", onTimerUpdate);
      room.off("host_assigned", onHostAssigned);
      room.off("game_over", onGameOver);
      room.off("round_over", onRoundOver); // Optional
    };
  }, [room]);

  // useEffect for handling the countdown during transition
  useEffect(() => {
    let timer: number;

    if (isTransitioning && nextGame) {
      console.log(`[Client] Starting countdown to switch to ${nextGame}`);
      timer = window.setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown > 1) {
            return prevCountdown - 1;
          } else {
            clearInterval(timer);
            setIsTransitioning(false);
            setCurrentGame(nextGame);
            setNextGame(null);
            console.log(`[Client] Switching to ${nextGame}`);
            return 10; // Reset countdown for the next transition
          }
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isTransitioning, nextGame]);

  const renderCurrentGame = () => {
    if (!inLobby) {
      return <h1>Please join the lobby to participate in games.</h1>;
    }

    if (isTransitioning) {
      return (
        <div className="transition-message">
          <h1>
            Transitioning to {nextGame} in {countdown}...
          </h1>
        </div>
      );
    }

    if (currentGame === "tournament_over") {
      // Tournament is over, display final leaderboard and winner
      return (
        <div style={{ textAlign: "center" }}>
          <h1>Tournament Over</h1>
          <h2>
            Winner: {leaderboard[0]?.id} with {leaderboard[0]?.points} points!
          </h2>
          <Leaderboard leaderboard={leaderboard} gameStarted={gameStarted} />
        </div>
      );
    }

    switch (currentGame) {
      case "welcome":
        return <h1>Welcome to the tournament</h1>;
      case "rlgl_round1":
      case "rlgl_round2":
      case "rlgl_round3":
        return <RedLightGreenLight room={room!} round={currentRound} />;
      case "final_puzzle":
        return <SlidingPuzzle room={room!} />;
      default:
        // Handle unexpected currentGame values
        console.warn(`Unknown currentGame state: ${currentGame}`);
        return <h1>Welcome to the tournament</h1>; // Default to welcome
    }
  };

  const startRound = (roundNumber: number) => {
    const gameKey = `rlgl_round${roundNumber}`;
    console.log(`[Client] Sending change_game: ${gameKey}`);
    room?.send("change_game", gameKey);
  };

  const startFinalPuzzle = () => {
    const gameKey = "final_puzzle";
    console.log(`[Client] Sending change_game: ${gameKey}`);
    room?.send("change_game", gameKey);
  };

  const endTournament = () => {
    const gameKey = "tournament_over";
    console.log(`[Client] Sending change_game: ${gameKey}`);
    room?.send("change_game", gameKey);
  };

  return (
    <div>
      <nav className="navigation">
        {inLobby && isHost && (
          <div className="host-controls">
            <h2>Host Controls</h2>
            <button
              onClick={() => startRound(1)}
              disabled={currentRound >= 1}
            >
              Start Round 1
            </button>
            <button
              onClick={() => startRound(2)}
              disabled={currentRound >= 2}
            >
              Start Round 2
            </button>
            <button
              onClick={() => startRound(3)}
              disabled={currentRound >= 3}
            >
              Start Round 3
            </button>
            <button
              onClick={() => startFinalPuzzle()}
              disabled={currentRound < 3 || currentGame === "final_puzzle"}
            >
              Start Final Puzzle
            </button>
            <button
              onClick={() => endTournament()}
              disabled={currentGame === "tournament_over"}
            >
              End Tournament
            </button>
          </div>
        )}
        {inLobby && !isHost && (
          <div className="host-info">
            <p>Host: {hostId || "Assigning..."}</p>
          </div>
        )}
      </nav>

      <main>
        {currentRound > 0 && (
          <div className="current-round">
            <h2>Current Round: {currentRound}</h2>
          </div>
        )}
        {renderCurrentGame()}
      </main>

      {inLobby && (
        <Leaderboard leaderboard={leaderboard} gameStarted={gameStarted} />
      )}

      <section>
        <h2>Lobby</h2>
        <div>
          {inLobby ? (
            <button onClick={handleLeaveLobby}>Leave Lobby</button>
          ) : (
            <button onClick={handleJoinLobby}>Join Lobby</button>
          )}
        </div>

        {inLobby && !gameStarted && (
          <>
            <h3>Players in Lobby:</h3>
            <ul>
              {players.map((player, index) => (
                <li key={index}>{player}</li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
};

export default App;
