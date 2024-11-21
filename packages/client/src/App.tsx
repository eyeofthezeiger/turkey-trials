// App.tsx

import React, { useState, useEffect } from "react";
import { Client, Room } from "colyseus.js";
import RedLightGreenLight from "./components/RedLightGreenLight";
import SlidingPuzzle from "./components/SlidingPuzzle";
import Leaderboard from "./components/Leaderboard";
import Lobby from "./components/Lobby";
import RoundWinner from "./components/RoundWinner";
import GameWinner from "./components/GameWinner";
import GameRules from "./components/GameRules"; // Import GameRules
import LobbyForm from "./components/LobbyForm"; // Import the new LobbyForm
import "./App.css"; // Import the consolidated CSS file

type GamePageKey =
  | "welcome"
  | "rlgl_round1"
  | "rlgl_round2"
  | "rlgl_round3"
  | "final_puzzle"
  | "round_winner"
  | "game_winner"
  | "tournament_over";

const serverUrl =
  process.env.NODE_ENV === "production"
    ? "wss://turkey-trials.onrender.com" // Replace with your actual Render URL
    : "ws://localhost:3000";

const client = new Client(serverUrl);

interface PlayerInfo {
  id: string;
  name: string;
  color: string;
}

const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GamePageKey>("welcome");
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
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

  // State to hold round and game winner data
  const [roundWinnerData, setRoundWinnerData] = useState<{
    round: number;
    winnerName: string;
    secondPlace: string;
    thirdPlace: string;
  } | null>(null);

  const [gameWinnerData, setGameWinnerData] = useState<{
    winnerName: string;
    totalPoints: number;
  } | null>(null);

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

  const handleJoinLobby = async (name: string, color: string) => {
    console.log("[Client] Attempting to join or create room...");
    try {
      const gameRoom = await client.joinOrCreate("game_room");
      setRoom(gameRoom);
      console.log("[Client] Joined room successfully!");
      console.log({ gameRoom });

      // Set the initial game state
      setCurrentGame(gameRoom.state.currentGame || "welcome");

      // Send the join lobby message to the server with name and color
      console.log("[Client] Sending join lobby request with name and color...");
      gameRoom.send("join_lobby", { name, color });
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
      setRoundWinnerData(null);
      setGameWinnerData(null);

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

    const onPlayerJoined = (data: { player: PlayerInfo }) => {
      console.log(`[Client] Player joined: ${data.player.name} (${data.player.id})`);
      setPlayers((prevPlayers) => [...prevPlayers, data.player]);

      // Update leaderboard to include the new player with 0 points if not already present
      setLeaderboard((prevLeaderboard) => {
        const playerExists = prevLeaderboard.some(
          (p) => p.id === data.player.id
        );
        if (!playerExists) {
          return [...prevLeaderboard, { id: data.player.id, points: 0 }];
        }
        return prevLeaderboard;
      });
    };

    const onPlayerLeft = (data: { playerId: string }) => {
      console.log(`[Client] Player left: ${data.playerId}`);
      setPlayers((prevPlayers) =>
        prevPlayers.filter((player) => player.id !== data.playerId)
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

    const onGameOver = (data: { winnerName: string; totalPoints: number }) => {
      console.log("[Client] Game over.");
      setGameWinnerData({
        winnerName: data.winnerName,
        totalPoints: data.totalPoints,
      });
      setCurrentGame("game_winner");
    };

    const onRoundOver = (data: { round: number; winnerName: string; secondPlace: string; thirdPlace: string }) => {
      console.log("[Client] Round over.");
      setRoundWinnerData({
        round: data.round,
        winnerName: data.winnerName,
        secondPlace: data.secondPlace,
        thirdPlace: data.thirdPlace,
      });
      setCurrentGame("round_winner");
      setIsTransitioning(false);
      setCountdown(0); // No countdown for immediate transition
    };

    const onGameWinner = () => {
      // Deprecated: Now handled by onGameOver with data
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
    room.onMessage("round_over", onRoundOver);
    // room.onMessage("game_winner", onGameWinner); // Deprecated

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
      room.off("round_over", onRoundOver);
      // room.off("game_winner", onGameWinner); // Deprecated
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
    if (isTransitioning) {
      return (
        <div className="transition-message">
          <h1>
            Transitioning to {nextGame} in {countdown}...
          </h1>
        </div>
      );
    }

    switch (currentGame) {
      case "welcome":
        return <h1>Welcome to the tournament</h1>;
      case "rlgl_round1":
      case "rlgl_round2":
      case "rlgl_round3":
        return <RedLightGreenLight room={room!} isHost={isHost} />;
      case "final_puzzle":
        return <SlidingPuzzle room={room!} />;
      case "round_winner":
        return roundWinnerData ? (
          <RoundWinner
            roundNumber={roundWinnerData.round}
            winnerName={roundWinnerData.winnerName}
            secondPlace={roundWinnerData.secondPlace}
            thirdPlace={roundWinnerData.thirdPlace}
          />
        ) : (
          <h2>Loading Round Winner...</h2>
        );
      case "game_winner":
        return gameWinnerData ? (
          <GameWinner
            winnerName={gameWinnerData.winnerName}
            totalPoints={gameWinnerData.totalPoints}
          />
        ) : (
          <h2>Loading Game Winner...</h2>
        );
      case "tournament_over":
        // Tournament is over, display final leaderboard and winner
        return (
          <div className="tournament-over">
            <h1>Tournament Over</h1>
            <h2>
              Winner: {leaderboard[0]?.id} with {leaderboard[0]?.points} points!
            </h2>
            <Leaderboard leaderboard={leaderboard} players={players} gameStarted={gameStarted} />
          </div>
        );
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

  // For testing purposes: Methods to trigger RoundWinner and GameWinner
  const triggerRoundWinner = () => {
    setNextGame("round_winner");
    setIsTransitioning(true);
    setCountdown(5); // Short countdown
  };

  const triggerGameWinner = () => {
    endTournament();
    setNextGame("game_winner");
    setIsTransitioning(true);
    setCountdown(5); // Short countdown
  };

  return (
    <div className="app-container">
      {/* Header/Navbar */}
      <header className="app-header">
        <h1>Turkey Trials 2024</h1>
      </header>

      {/* Main Content Grid */}
      <div className="main-grid">
        {/* Left Column */}
        <aside className="left-column">
          {isHost ? (
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
                disabled={currentGame === "final_puzzle"}
              >
                Start Final Puzzle
              </button>
              <button
                onClick={() => endTournament()}
                disabled={currentGame === "tournament_over"}
              >
                End Tournament
              </button>
              {/* Testing Buttons */}
              <button onClick={triggerRoundWinner}>Show Round Winner</button>
              <button onClick={triggerGameWinner}>Show Game Winner</button>
            </div>
          ) : (
            <GameRules /> // Show Game Rules for non-hosts
          )}
        </aside>

        {/* Center Column */}
        <section className="center-column">
          {currentRound > 0 && (
            <div className="current-round">
              <h2>Current Round: {currentRound}</h2>
            </div>
          )}
          {renderCurrentGame()}
        </section>

        {/* Right Column */}
        <aside className="right-column">
          {inLobby ? (
            <div>
              <button onClick={handleLeaveLobby} className="leave-button">
                Leave Lobby
              </button>
              {!gameStarted && (
                <div className="lobby-info">
                  <h3>Players in Lobby:</h3>
                  <ul>
                    {players.map((player) => (
                      <li key={player.id} style={{ color: player.color }}>
                        {player.name} {player.id === hostId && "(Host)"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <LobbyForm onJoin={(name, color) => handleJoinLobby(name, color)} />
          )}

          {inLobby && (
            <Leaderboard leaderboard={leaderboard} players={players} gameStarted={gameStarted} />
          )}
        </aside>
      </div>
    </div>
  );
};

export default App;
