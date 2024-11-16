import { Room, Client } from "colyseus";

import { TurkeyTrialsSessionState } from "../model/game-state";
import { Player } from "../model/game-player";
import { isRoomEmpty, RED_LIGHT_GAME_TYPE } from "../utils/room-helpers";
import { setupTicTacToeMessages } from "../messages/tic-tac-toe";

interface LobbyOnJoinProps {
  name: string;
  color: string;
}

const HOST_ASSIGNED_MSG = "hostAssigned" as const;
const PLAYER_JOINED_MSG = "playerJoined" as const;

const ON_START_MSG = "startGame" as const;

export class GameLobby extends Room<TurkeyTrialsSessionState> {
  onCreate() {
    this.setState(new TurkeyTrialsSessionState());
    console.log("GameLobby room created");

    this.onMessage(ON_START_MSG, (client: Client) => {
      if (this.state.hostId !== client.sessionId) {
        client.send("error", "Only the host can start the game.");
        return;
      }

      this.state.gameType = RED_LIGHT_GAME_TYPE;
      // this.changeGameType();
    });

    setupTicTacToeMessages(this);
  }

  onJoin(client: Client, { name, color }: LobbyOnJoinProps) {
    const player = new Player(client.sessionId, name, color);

    if (isRoomEmpty(this.state.players)) {
      this.state.hostId = player.id;
      this.broadcast(HOST_ASSIGNED_MSG, {
        id: player.id,
      });
    }

    this.state.players.set(player.id, player);
    this.broadcast(PLAYER_JOINED_MSG, player.toJSON());
  }

  onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId);

    if (player) {
      console.log(`Player ${player.name} (${client.sessionId}) disconnected.`);
      // Keep the player in the game state for potential reconnection
      this.broadcast("playerLeft", { id: client.sessionId });
    }
  }

  /* private changeGameType() {
    const nextGameType = getNextGameType(this.state.gameType);
    this.state.gameType = nextGameType;

    this.clock.setTimeout(() => {
      if (this.state.gameType !== END_GAME_TYPE) {
        this.changeGameType();
      }
    }, 60_000);
  } */
}
