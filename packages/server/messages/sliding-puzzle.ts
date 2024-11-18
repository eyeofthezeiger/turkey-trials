import { Client } from "colyseus";
import { GameLobby } from "../room/GameLobby";

const SLIDING_PUZZLE_PREFIX = "slidingPuzzle_" as const;

const START_PUZZLE = `${SLIDING_PUZZLE_PREFIX}startPuzzle` as const;
const COMPLETE_PUZZLE = `${SLIDING_PUZZLE_PREFIX}completePuzzle` as const;

interface PlayerData {
  startTime: number;
  endTime?: number;
}

const setupSlidingPuzzleMessages = (room: GameLobby) => {
  const players: Map<string, PlayerData> = new Map();

  room.onMessage(START_PUZZLE, (client: Client) => {
    // Record the start time for the player
    players.set(client.sessionId, { startTime: Date.now() });
    client.send("puzzleStarted", { message: "Puzzle started!" });
    console.log(`Puzzle started for player: ${client.sessionId}`);
  });

  room.onMessage(COMPLETE_PUZZLE, (client: Client) => {
    const playerData = players.get(client.sessionId);

    if (playerData) {
      playerData.endTime = Date.now();
      const completionTime = playerData.endTime - playerData.startTime;

      // Send the completion time back to the client
      client.send("puzzleCompleted", { completionTime });
      console.log(
        `Puzzle completed for player: ${client.sessionId}, Time: ${completionTime}ms`
      );
    } else {
      client.send("error", { message: "Puzzle was not started!" });
    }
  });

  room.onLeave((client: Client) => {
    // Clean up player data when they leave
    if (players.has(client.sessionId)) {
      players.delete(client.sessionId);
      console.log(`Player ${client.sessionId} removed from Sliding Puzzle`);
    }
  });
};

export { setupSlidingPuzzleMessages };
