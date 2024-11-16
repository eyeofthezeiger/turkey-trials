import { MapSchema, Schema, type } from "@colyseus/schema";

import { RedLightGreenLightState } from "./red-light-green-light";
import { TriviaState } from "./triva-state";
import { PicturePuzzleState } from "./picture-puzzle";
import { TicTacToeSessionState } from "./tic-tac-toe";
import { RockPaperScissorState } from "./rock-paper-scissor";
import { Player } from "./game-player";
import { LOBBY_GAME_TYPE } from "../room/initialRoom";

class TurkeyTrialsSessionState extends Schema {
  @type("string") hostId: string;
  @type("string") gameType: string = LOBBY_GAME_TYPE;
  @type({ map: Player }) players = new MapSchema<Player>();

  @type(RedLightGreenLightState) redLightGreenLightState =
    new RedLightGreenLightState();
  @type(PicturePuzzleState) picturePuzzleState = new PicturePuzzleState();
  @type(TicTacToeSessionState) ticTacToeState = new TicTacToeSessionState();
  @type(RockPaperScissorState) rockPaperScissorState =
    new RockPaperScissorState();
  @type(TriviaState) triviaState = new TriviaState();
}

export { TurkeyTrialsSessionState };
