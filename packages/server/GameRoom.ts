// server/GameRoom.ts
import { Room, Client } from 'colyseus';

class GameRoom extends Room {
  onCreate() {
    this.maxClients = 60;
    console.log('Game room created with Redis presence');
  }

  onJoin(client: Client) {
    console.log(`Client ${client.sessionId} joined`);
  }

  onLeave(client: Client) {
    console.log(`Client ${client.sessionId} left`);
  }

  onDispose() {
    console.log('Room disposed');
  }
}

export default GameRoom;
