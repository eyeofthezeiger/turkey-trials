import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import { GameLobby } from "./room/initialRoom";
import { TicTacToeRoom } from "./TicTacToeRoom";
import { RedLightGreenLightRoom } from "./RedLightGreenLightRoom";

const app = express();
const httpServer = createServer(app);
const gameServer = new Server({ server: httpServer });

gameServer.define("game_lobby", GameLobby);
gameServer.define("tic_tac_toe", TicTacToeRoom);
gameServer.define("red_light_green_light", RedLightGreenLightRoom);

const PORT = 2567;
httpServer.listen(PORT, () =>
  console.log(`Server running on ws://localhost:${PORT}`),
);
