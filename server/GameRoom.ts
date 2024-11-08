import { Room, Client } from 'colyseus';
import { RedisPresence } from '@colyseus/redis-presence';

class GameRoom extends Room {
  onCreate() {
    this.maxClients = 60;
    // Initialize RedisPresence with the Redis URL
    this.setPresence(new RedisPresence(process.env.REDIS_URL));
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
