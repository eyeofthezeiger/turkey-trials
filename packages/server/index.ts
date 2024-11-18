// import { Server } from "colyseus";
// import { createServer } from "http";
// import express from "express";
// import { GameLobby } from "./room/GameLobby";


// const app = express();
// const httpServer = createServer(app);
// const gameServer = new Server({ server: httpServer });

// gameServer.define("game_lobby", GameLobby);

// const PORT = 2567;
// httpServer.listen(PORT, () =>
//   console.log(`Server running on ws://localhost:${PORT}`),
// );

import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import { GameRoom } from "./room/GameRoom";

const app = express();
const port = 3000;
const httpServer = createServer(app);
const gameServer = new Server({
  server: httpServer,
});

gameServer.define("game_room", GameRoom);

httpServer.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});



