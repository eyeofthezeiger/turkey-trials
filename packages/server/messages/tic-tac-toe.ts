import { Client } from "colyseus";

import { GameLobby } from "../room/GameLobby";

const TIC_TAC_TOE_PREFIX = "ticTacToe_" as const;

const MOVE = `${TIC_TAC_TOE_PREFIX}move` as const;

const setupTicTacToeMessages = (room: GameLobby) => {
  room.onMessage(MOVE, (client: Client) => {
    console.log("do shit");
  });
};

export { setupTicTacToeMessages };
