import { Client } from "colyseus";

import { GameLobby } from "../room/initialRoom";

const setupTicTacToeMessages = (room: GameLobby) => {
  room.onMessage("test", (client: Client) => {
    console.log("do shit");
  });
};

export { setupTicTacToeMessages };
