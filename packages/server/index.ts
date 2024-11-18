import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import path from "path";
import { GameRoom } from "./room/GameRoom";

const app = express();
const port = process.env.PORT || 3000;
const httpServer = createServer(app);
const gameServer = new Server({
  server: httpServer,
});

// Serve React client build files
app.use(express.static(path.join(__dirname, "../../../packages/client/dist")));

// Catch-all route to serve React's index.html for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../packages/client/dist", "index.html"));
});

gameServer.define("game_room", GameRoom);

httpServer.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
