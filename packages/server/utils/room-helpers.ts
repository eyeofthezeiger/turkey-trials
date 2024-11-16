import { MapSchema } from "@colyseus/schema";

import { Player } from "../model/game-player";

const LOBBY_GAME_TYPE = "lobby" as const;
const RED_LIGHT_GAME_TYPE = "redLight" as const;
const TIC_TAC_TOE_GAME_TYPE = "ticTacToe" as const;
const ROCK_PAPER_SCISSOR_GAME_TYPE = "rockPaperScissor" as const;
const PICTURE_PUZZLE_GAME_TYPE = "picturePuzzle" as const;
const END_GAME_TYPE = "end" as const;
const ERROR_GAME_TYPE = "error" as const;

const isRoomEmpty = (players: MapSchema<Player>): boolean => players.size === 0;

const getNextGameType = (gameType: string) => {
  switch (gameType) {
    case LOBBY_GAME_TYPE:
      return RED_LIGHT_GAME_TYPE;
    case RED_LIGHT_GAME_TYPE:
      return TIC_TAC_TOE_GAME_TYPE;
    case TIC_TAC_TOE_GAME_TYPE:
      return ROCK_PAPER_SCISSOR_GAME_TYPE;
    case ROCK_PAPER_SCISSOR_GAME_TYPE:
      return PICTURE_PUZZLE_GAME_TYPE;
    case PICTURE_PUZZLE_GAME_TYPE:
      return END_GAME_TYPE;
    default:
      ERROR_GAME_TYPE;
  }
};

export {
  isRoomEmpty,
  getNextGameType,
  LOBBY_GAME_TYPE,
  END_GAME_TYPE,
  RED_LIGHT_GAME_TYPE,
};
