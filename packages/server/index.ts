import { Server } from "colyseus";
import express from "express";
import { createServer } from "http";
import { GameLobby } from "./room/initialRoom"; // Adjust the path as needed

const app = express();
const httpServer = createServer(app);

const gameServer = new Server({
  server: httpServer,
});

// Register the GameLobby room
gameServer.define("game_lobby", GameLobby);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const PORT = 2567;
httpServer.listen(PORT, () => {
  console.log(`Game server is running on ws://localhost:${PORT}`);
});
