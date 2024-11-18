import { Room, Client } from "colyseus";
import { TurkeyTrialsSessionState } from "../model/game-state";
import { Player } from "../model/game-player";
import {
  isRoomEmpty,
  RED_LIGHT_GAME_TYPE,
  getNextGameType,
  getGameTypeLabel,
} from "../utils/room-helpers";
import { setupTicTacToeMessages } from "../messages/tic-tac-toe";

interface LobbyOnJoinProps {
  name: string;
  color: string;
}

const HOST_ASSIGNED_MSG = "hostAssigned" as const;
const PLAYER_JOINED_MSG = "playerJoined" as const;
const GAME_STARTED_MSG = "gameStarted" as const;
const ERROR_MSG = "error" as const;
const ON_START_MSG = "startGame" as const;
const TRANSITION_GAME_MSG = "transitionGame" as const;

export class GameLobby extends Room<TurkeyTrialsSessionState> {
  onCreate() {
    this.setState(new TurkeyTrialsSessionState());
    console.log("GameLobby room created");

    // Handle starting the game
    this.onMessage(ON_START_MSG, (client: Client) => {
      if (this.state.hostId !== client.sessionId) {
        client.send(ERROR_MSG, "Only the host can start the game.");
        return;
      }

      this.state.gameType = RED_LIGHT_GAME_TYPE;
      this.logGameType();
      this.broadcast(GAME_STARTED_MSG, { gameType: this.state.gameType });
      console.log("Game started by host:", this.state.hostId);
    });

    // Handle game type transition
    this.onMessage(TRANSITION_GAME_MSG, (client: Client) => {
      if (this.state.hostId !== client.sessionId) {
        client.send(ERROR_MSG, "Only the host can transition the game.");
        return;
      }

      this.state.gameType = getNextGameType(this.state.gameType);
      this.logGameType();
      this.broadcast(GAME_STARTED_MSG, { gameType: this.state.gameType });

      // Log game type transition
      console.log(`Game transitioned to: ${getGameTypeLabel(this.state.gameType)}`);
    });

    // Setup Tic Tac Toe message handlers
    setupTicTacToeMessages(this);
  }

  onJoin(client: Client, { name, color }: LobbyOnJoinProps) {
    const player = new Player(client.sessionId, name, color);

    // Assign host if room is empty
    if (isRoomEmpty(this.state.players)) {
      this.state.hostId = player.id;
      this.broadcast(HOST_ASSIGNED_MSG, { hostId: player.id });
    }

    // Add player to room state
    this.state.players.set(player.id, player);
    this.broadcast(PLAYER_JOINED_MSG, player.toJSON());
  }

  onLeave(client: Client) {
    const player = this.state.players.get(client.sessionId);

    if (player) {
      console.log(`Player ${player.name} (${client.sessionId}) disconnected.`);
      this.broadcast("playerLeft", { id: client.sessionId });

      // Reassign host if the host leaves
      if (this.state.hostId === client.sessionId) {
        const remainingPlayers = Array.from(this.state.players.values());
        if (remainingPlayers.length > 0) {
          this.state.hostId = remainingPlayers[0].id;
          this.broadcast(HOST_ASSIGNED_MSG, { hostId: this.state.hostId });
          console.log("New host assigned:", this.state.hostId);
        }
      }
    }
  }

  private logGameType() {
    console.log(`Current game type: ${getGameTypeLabel(this.state.gameType)}`);
  }
}
