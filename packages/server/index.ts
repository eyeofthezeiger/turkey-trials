import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import { GameLobby } from "./room/initialRoom";
import { TicTacToeRoom } from "./TicTacToeRoom";

const app = express();
const httpServer = createServer(app);
const gameServer = new Server({ server: httpServer });

gameServer.define("game_lobby", GameLobby);
gameServer.define("tic_tac_toe", TicTacToeRoom);

const PORT = 2567;
httpServer.listen(PORT, () => console.log(`Server running on ws://localhost:${PORT}`));
