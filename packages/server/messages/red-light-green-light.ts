import { Client } from "colyseus";
import { GameLobby } from "../room/GameLobby";
import { RedLightGreenLightState } from "../model/red-light-green-light-state";

const RED_LIGHT_GREEN_LIGHT_PREFIX = "redLight_" as const;

const MOVE = `${RED_LIGHT_GREEN_LIGHT_PREFIX}move` as const;

interface Player {
  position: number;
  id: string;
}

const setupRedLightGreenLightMessages = (room: GameLobby) => {
  const state = new RedLightGreenLightState();
  room.state.redLightGreenLightState = state;

  let lightTimer: NodeJS.Timeout | null = null;

  const startAutomaticLightSwitch = () => {
    console.log(`[SERVER] Starting light toggle loop.`);
    lightTimer = setInterval(() => {
      state.light = state.light === "Red" ? "Green" : "Red";
      console.log(`[SERVER] Light toggled to: ${state.light}`);
      room.broadcast("lightToggled", { light: state.light });
    }, Math.random() * 3000 + 2000);
  };

  const checkWin = (client: Client) => {
    const player = state.players.get(client.sessionId);
    if (player && player.position >= 50) {
      room.broadcast("gameOver", { winner: client.sessionId });
      console.log(`[SERVER] Player ${client.sessionId} won the game.`);
      resetGame();
    }
  };

  const resetGame = () => {
    state.players.forEach((player) => (player.position = 0));
    state.light = "Red";
    room.broadcast("lightToggled", { light: state.light });
    console.log("[SERVER] Game reset.");
  };

  room.onMessage(MOVE, (client) => {
    const player = state.players.get(client.sessionId);
    console.log(`[SERVER] Move message received from client: ${client.sessionId}`);
    if (player) {
      console.log(`[SERVER] Player position before move: ${player.position}`);
      console.log(`[SERVER] Current light: ${state.light}`);
      if (state.light === "Green") {
        player.position += 10;
        console.log(`[SERVER] Player position after move: ${player.position}`);
        room.broadcast("playerMoved", { id: client.sessionId, position: player.position });
        checkWin(client);
      } else {
        console.log(`[SERVER] Player moved during Red light. Penalizing.`);
        player.position = 0; // Reset player position
        room.broadcast("playerMoved", { id: client.sessionId, position: player.position });
      }
    } else {
      console.log(`[SERVER] No player found for session: ${client.sessionId}`);
    }
  });

  room.onJoin((client: Client) => {
    console.log(`[SERVER] Player joined: ${client.sessionId}`);
    state.players.set(client.sessionId, { id: client.sessionId, position: 0 });
    room.broadcast("playerJoined", { id: client.sessionId });
  });

  room.onLeave((client: Client) => {
    console.log(`[SERVER] Player left: ${client.sessionId}`);
    state.players.delete(client.sessionId);
    room.broadcast("playerLeft", { id: client.sessionId });
  });

  room.onDispose(() => {
    if (lightTimer) clearInterval(lightTimer);
    console.log("[SERVER] Light toggler disposed.");
  });

  startAutomaticLightSwitch();
};

export { setupRedLightGreenLightMessages };
