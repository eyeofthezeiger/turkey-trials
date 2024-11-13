// import express, { Request, Response } from 'express';
// import { Server } from 'colyseus';
// import { createServer } from 'http';
// import { RedisPresence } from '@colyseus/redis-presence';
// import * as dotenv from 'dotenv';
// import connectDB from './db'; // Import MongoDB connection
// import GameRoom from './GameRoom'; // Import the Colyseus room

// dotenv.config();

// // Initialize Express app and HTTP server
// const app = express();
// const httpServer = createServer(app);

// // Initialize Colyseus game server with Redis presence
// const gameServer = new Server({
//   server: httpServer,
//   presence: new RedisPresence(process.env.REDIS_URL), // Redis Presence for distributed state
// });

// // Define Colyseus game room
// gameServer.define('game_room', GameRoom);

// // Connect to MongoDB
// connectDB();

// // Basic route for health check
// app.get('/', (req: Request, res: Response) => {
//   res.send('Server is running!');
// });

// // Start server on specified port
// const PORT = process.env.PORT || 3000;
// httpServer.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// index.ts

import { Server } from "colyseus";
const express = require("express");
import { createServer } from "http";
import { TicTacToeRoom } from "./TicTacToeRoom"

const app = express();
const server = createServer(app);
const gameServer = new Server({
  server,
});

// Register the Tic Tac Toe room
gameServer.define("tic_tac_toe", TicTacToeRoom);

// Start the server
const PORT = 2567;
gameServer.listen(PORT);
console.log(`Game server is listening on ws://localhost:${PORT}`);
