import { Server } from "colyseus";
import { createServer } from "http";
import express, { Request, Response } from "express";
import path from "path";
import { GameRoom } from "./room/GameRoom";

const app = express();
const port = process.env.PORT || 3000;
const httpServer = createServer(app);
const gameServer = new Server({
  server: httpServer,
});

// Resolve the absolute path to the client build directory
const clientDistPath = path.resolve(__dirname, "../../client/dist");
console.log("Resolved clientDistPath:", clientDistPath);

// Serve React client build files
app.use(express.static(clientDistPath));

// Catch-all route to serve React's index.html for SPA routing
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

gameServer.define("game_room", GameRoom);

httpServer.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
