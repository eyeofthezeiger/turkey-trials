import { Schema, type } from "@colyseus/schema";

import { RedLightGreenLightState } from "./red-light-green-light";
import { TriviaState } from "./triva-state";
import { PicturePuzzleState } from "./picture-puzzle";
import { TicTacToeSessionState } from "./tic-tac-toe";
import { RockPaperScissorState } from "./rock-paper-scissor";

class TurkeyTrialsSessionState extends Schema {
  @type(RedLightGreenLightState) redLightGreenLightState =
    new RedLightGreenLightState();
  @type(PicturePuzzleState) picturePuzzleState = new PicturePuzzleState();
  @type(TicTacToeSessionState) ticTacToeState = new TicTacToeSessionState();
  @type(RockPaperScissorState) rockPaperScissorState =
    new RockPaperScissorState();
  @type(TriviaState) triviaState = new TriviaState();
}

export { TurkeyTrialsSessionState };
